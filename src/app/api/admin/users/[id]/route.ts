import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        business: {
          include: {
            services: true,
            _count: { select: { bookings: true, reviews: true } },
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bookings: true, payments: true, reviews: true },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!['CUSTOMER', 'BUSINESS_OWNER', 'ADMIN'].includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
    });

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await db.user.delete({
      where: { id },
    });

    return successResponse({ message: 'User deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
