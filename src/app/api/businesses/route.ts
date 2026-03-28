import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession, requireAuth, requireBusinessOwner } from '@/lib/auth';
import { createBusinessSchema, searchBusinessSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError, parsePagination, generateSlug, paginatedResponse } from '@/lib/api-utils';

// Search/list businesses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minRating = searchParams.get('minRating');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    const where: Record<string, unknown> = {
      isActive: true,
      verificationStatus: 'APPROVED',
    };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category) {
      where.services = { some: { category } };
    }

    if (city) {
      where.city = { contains: city };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        skip,
        take: limit,
        include: {
          services: {
            where: { isActive: true },
            take: 5,
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: [
          { subscriptionPlan: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      db.business.count({ where }),
    ]);

    // Filter by distance if coordinates provided
    let filteredBusinesses = businesses;
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      filteredBusinesses = businesses.filter((b) => {
        if (!b.latitude || !b.longitude) return false;
        const distance = calculateDistance(userLat, userLng, b.latitude, b.longitude);
        return distance <= radiusKm;
      });
    }

    return paginatedResponse(filteredBusinesses, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create new business
export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validated = createBusinessSchema.parse(body);

    // Check if user already has a business
    const existingBusiness = await db.business.findUnique({
      where: { ownerId: user.id },
    });

    if (existingBusiness) {
      return errorResponse('You already have a business registered', 409);
    }

    // Generate unique slug
    let slug = generateSlug(validated.name);
    const existingSlug = await db.business.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const business = await db.business.create({
      data: {
        ownerId: user.id,
        name: validated.name,
        slug,
        description: validated.description,
        phone: validated.phone,
        email: validated.email,
        website: validated.website,
        address: validated.address,
        city: validated.city,
        country: validated.country,
        latitude: validated.latitude,
        longitude: validated.longitude,
        serviceRadius: validated.serviceRadius,
      },
      include: {
        services: true,
      },
    });

    return successResponse(business, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
