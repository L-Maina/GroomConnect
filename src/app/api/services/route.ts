import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canManageBusiness } from '@/lib/auth';
import { createServiceSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError, parsePagination, paginatedResponse } from '@/lib/api-utils';

// List services for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const category = searchParams.get('category');
    const { page, limit, skip } = parsePagination(searchParams);

    if (!businessId) {
      return errorResponse('Business ID is required', 400);
    }

    const where: Record<string, unknown> = {
      businessId,
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.service.count({ where }),
    ]);

    return paginatedResponse(services, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create new service
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createServiceSchema.parse(body);

    // Verify business ownership
    const business = await db.business.findFirst({
      where: { ownerId: user.id },
    });

    if (!business) {
      return errorResponse('You do not have a registered business', 404);
    }

    const service = await db.service.create({
      data: {
        businessId: business.id,
        ...validated,
      },
    });

    return successResponse(service, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
