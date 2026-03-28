import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all premium listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    const listings = await db.premiumListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.premiumListing.count({ where });

    // Calculate stats
    const stats = {
      pending: await db.premiumListing.count({ where: { status: 'PENDING' } }),
      active: await db.premiumListing.count({ where: { status: 'ACTIVE' } }),
      expired: await db.premiumListing.count({ where: { status: 'EXPIRED' } }),
      totalRevenue: await db.premiumListing.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true },
      }),
    };

    return NextResponse.json({
      listings,
      total,
      stats,
      hasMore: offset + listings.length < total,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST - Create a new premium listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      businessName,
      plan,
      price,
      startDate,
      endDate,
    } = body;

    if (!businessId || !businessName || !plan || !price || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if business already has a listing
    const existingListing = await db.premiumListing.findUnique({
      where: { businessId },
    });

    if (existingListing && existingListing.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Business already has an active premium listing' },
        { status: 400 }
      );
    }

    const listing = await db.premiumListing.create({
      data: {
        businessId,
        businessName,
        plan,
        price,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING',
      },
    });

    // Update business subscription plan
    await db.business.update({
      where: { id: businessId },
      data: { subscriptionPlan: plan },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// PUT - Update listing status/details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, status, plan, price, endDate, impressions, clicks, conversions } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (plan) {
      updateData.plan = plan;
    }
    
    if (price !== undefined) {
      updateData.price = price;
    }
    
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }
    
    if (impressions !== undefined) {
      updateData.impressions = impressions;
    }
    
    if (clicks !== undefined) {
      updateData.clicks = clicks;
    }
    
    if (conversions !== undefined) {
      updateData.conversions = conversions;
    }

    const listing = await db.premiumListing.update({
      where: { id: listingId },
      data: updateData,
    });

    // Update business subscription plan if status changed to active
    if (status === 'ACTIVE' && listing.plan) {
      await db.business.update({
        where: { id: listing.businessId },
        data: { subscriptionPlan: listing.plan },
      });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const listing = await db.premiumListing.findUnique({
      where: { id },
    });

    if (listing) {
      // Update business subscription plan to FREE
      await db.business.update({
        where: { id: listing.businessId },
        data: { subscriptionPlan: 'FREE' },
      });
    }

    await db.premiumListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
