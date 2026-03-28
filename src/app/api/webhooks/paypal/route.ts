import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, handleApiError } from '@/lib/api-utils';

// PayPal webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // In production, verify webhook signature using PayPal's verification

    const eventType = body.event_type;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = body.resource;
        const transactionId = resource.id;

        const payment = await db.payment.findFirst({
          where: { transactionId },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });

          await db.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });

          await db.notification.create({
            data: {
              userId: payment.userId,
              title: 'Payment Successful',
              message: `Your PayPal payment was successful`,
              type: 'PAYMENT_SUCCESS',
            },
          });
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const resource = body.resource;
        const transactionId = resource.id;

        const payment = await db.payment.findFirst({
          where: { transactionId },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: eventType.includes('REFUNDED') ? 'REFUNDED' : 'FAILED',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
