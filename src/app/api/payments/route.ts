import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createPaymentSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// List payments
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const where: Record<string, unknown> = { userId: user.id };

    // Admin can see all payments
    if (user.role === 'ADMIN') {
      delete where.userId;
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            business: { select: { id: true, name: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(payments);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create payment (initiate payment)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createPaymentSchema.parse(body);

    // Verify booking exists and belongs to user
    const booking = await db.booking.findUnique({
      where: { id: validated.bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    if (booking.customerId !== user.id) {
      return errorResponse('This booking does not belong to you', 403);
    }

    if (booking.payment) {
      return errorResponse('Payment already exists for this booking', 409);
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId: validated.bookingId,
        userId: user.id,
        amount: validated.amount,
        currency: validated.currency,
        paymentMethod: validated.paymentMethod,
        status: 'PENDING',
      },
    });

    // In production, integrate with actual payment gateways
    // For now, simulate successful payment
    if (process.env.NODE_ENV === 'development') {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: `sim_${Date.now()}`,
        },
      });

      // Update booking status
      await db.booking.update({
        where: { id: validated.bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Payment Successful',
          message: `Payment of ${validated.currency} ${validated.amount} completed`,
          type: 'PAYMENT_SUCCESS',
        },
      });
    }

    return successResponse(payment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
