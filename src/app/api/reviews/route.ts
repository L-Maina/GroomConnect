import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError, parsePagination, paginatedResponse } from '@/lib/api-utils';

// List reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (businessId) {
      where.businessId = businessId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, avatar: true },
          },
          booking: {
            select: { service: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.review.count({ where }),
    ]);

    return paginatedResponse(reviews, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create review
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    // Verify booking exists and is completed
    const booking = await db.booking.findUnique({
      where: { id: validated.bookingId },
      include: { review: true },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    if (booking.customerId !== user.id) {
      return errorResponse('This booking does not belong to you', 403);
    }

    if (booking.status !== 'COMPLETED') {
      return errorResponse('You can only review completed bookings', 400);
    }

    if (booking.review) {
      return errorResponse('You have already reviewed this booking', 409);
    }

    const review = await db.review.create({
      data: {
        customerId: user.id,
        businessId: validated.businessId,
        bookingId: validated.bookingId,
        rating: validated.rating,
        comment: validated.comment,
        isVerified: true,
      },
    });

    // Update business rating
    const stats = await db.review.aggregate({
      where: { businessId: validated.businessId },
      _avg: { rating: true },
      _count: true,
    });

    await db.business.update({
      where: { id: validated.businessId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    // Create notification for business owner
    const business = await db.business.findUnique({
      where: { id: validated.businessId },
      select: { ownerId: true },
    });

    if (business) {
      await db.notification.create({
        data: {
          userId: business.ownerId,
          title: 'New Review',
          message: `You received a ${validated.rating}-star review`,
          type: 'NEW_REVIEW',
          data: JSON.stringify({ reviewId: review.id }),
        },
      });
    }

    return successResponse(review, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
