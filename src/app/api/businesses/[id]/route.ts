import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canManageBusiness } from '@/lib/auth';
import { updateBusinessSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get business by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const business = await db.business.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        services: {
          where: { isActive: true },
        },
        staff: {
          where: { isActive: true },
        },
        portfolio: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        reviews: {
          include: {
            customer: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { reviews: true, favorites: true },
        },
      },
    });

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    return successResponse(business);
  } catch (error) {
    return handleApiError(error);
  }
}

// Update business
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const validated = updateBusinessSchema.parse(body);

    const business = await db.business.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    if (!canManageBusiness(user, business.ownerId)) {
      return errorResponse('You do not have permission to update this business', 403);
    }

    const updatedBusiness = await db.business.update({
      where: { id },
      data: validated,
    });

    return successResponse(updatedBusiness);
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete business
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const business = await db.business.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    if (!canManageBusiness(user, business.ownerId)) {
      return errorResponse('You do not have permission to delete this business', 403);
    }

    await db.business.delete({
      where: { id },
    });

    return successResponse({ message: 'Business deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
