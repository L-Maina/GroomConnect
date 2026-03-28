import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError, parsePagination, paginatedResponse } from '@/lib/api-utils';

// List bookings
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const status = searchParams.get('status');
    const businessId = searchParams.get('businessId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: Record<string, unknown> = {};

    // Filter by user role
    if (user.role === 'CUSTOMER') {
      where.customerId = user.id;
    } else if (user.role === 'BUSINESS_OWNER') {
      const business = await db.business.findUnique({
        where: { ownerId: user.id },
        select: { id: true },
      });
      if (business) {
        where.businessId = business.id;
      }
    }
    // Admin sees all

    if (status) {
      where.status = status;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (fromDate || toDate) {
      const dateFilter: Record<string, string> = {};
      if (fromDate) dateFilter.gte = fromDate;
      if (toDate) dateFilter.lte = toDate;
      where.date = dateFilter;
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, avatar: true, email: true, phone: true },
          },
          business: {
            select: { id: true, name: true, slug: true, address: true },
          },
          service: {
            select: { id: true, name: true, price: true, duration: true },
          },
          staff: {
            select: { id: true, name: true, avatar: true },
          },
          payment: true,
          review: true,
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      }),
      db.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create booking
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    // Get service details for price
    const service = await db.service.findUnique({
      where: { id: validated.serviceId },
      include: { business: true },
    });

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Check if time slot is available
    const existingBooking = await db.booking.findFirst({
      where: {
        businessId: validated.businessId,
        date: validated.date,
        startTime: validated.startTime,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    if (existingBooking) {
      return errorResponse('This time slot is no longer available', 409);
    }

    const booking = await db.booking.create({
      data: {
        customerId: user.id,
        businessId: validated.businessId,
        serviceId: validated.serviceId,
        staffId: validated.staffId,
        date: validated.date,
        startTime: validated.startTime,
        endTime: validated.endTime,
        notes: validated.notes,
        totalAmount: service.discountPrice || service.price,
        status: 'PENDING',
      },
      include: {
        business: true,
        service: true,
      },
    });

    // Create notification for business owner
    await db.notification.create({
      data: {
        userId: service.business.ownerId,
        title: 'New Booking',
        message: `New booking request from ${user.name || user.email}`,
        type: 'BOOKING_CONFIRMED',
        data: JSON.stringify({ bookingId: booking.id }),
      },
    });

    return successResponse(booking, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
