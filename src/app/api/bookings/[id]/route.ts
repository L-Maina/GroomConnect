import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canViewBooking } from '@/lib/auth';
import { updateBookingSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, avatar: true, email: true, phone: true },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            phone: true,
            email: true,
          },
        },
        service: true,
        staff: true,
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    const canView = await canViewBooking(user, booking.customerId, booking.businessId);
    if (!canView) {
      return errorResponse('You do not have permission to view this booking', 403);
    }

    return successResponse(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

// Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const validated = updateBookingSchema.parse(body);

    const booking = await db.booking.findUnique({
      where: { id },
      include: { business: true, customer: true },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    const canView = await canViewBooking(user, booking.customerId, booking.businessId);
    if (!canView) {
      return errorResponse('You do not have permission to update this booking', 403);
    }

    // Status transition validation
    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'NO_SHOW': [],
    };

    const allowed = allowedTransitions[booking.status] || [];
    if (!allowed.includes(validated.status)) {
      return errorResponse(`Cannot change status from ${booking.status} to ${validated.status}`, 400);
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: validated.status,
        notes: validated.notes,
      },
    });

    // Create notification for relevant party
    const notifyUserId = user.id === booking.customerId
      ? booking.business.ownerId
      : booking.customerId;

    await db.notification.create({
      data: {
        userId: notifyUserId,
        title: 'Booking Updated',
        message: `Booking status changed to ${validated.status}`,
        type: validated.status === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'BOOKING_CONFIRMED',
        data: JSON.stringify({ bookingId: booking.id }),
      },
    });

    return successResponse(updatedBooking);
  } catch (error) {
    return handleApiError(error);
  }
}

// Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    const canView = await canViewBooking(user, booking.customerId, booking.businessId);
    if (!canView) {
      return errorResponse('You do not have permission to cancel this booking', 403);
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return errorResponse('This booking cannot be cancelled', 400);
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return successResponse({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    return handleApiError(error);
  }
}
