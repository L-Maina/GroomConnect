import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all advertisements
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

    const advertisements = await db.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.advertisement.count({ where });

    // Calculate stats
    const stats = {
      pending: await db.advertisement.count({ where: { status: 'PENDING' } }),
      active: await db.advertisement.count({ where: { status: 'ACTIVE' } }),
      completed: await db.advertisement.count({ where: { status: 'COMPLETED' } }),
      totalBudget: await db.advertisement.aggregate({
        _sum: { budget: true },
      }),
    };

    return NextResponse.json({
      advertisements,
      total,
      stats,
      hasMore: offset + advertisements.length < total,
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

// POST - Create a new advertisement request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      businessId,
      contactEmail,
      contactPhone,
      adPackage,
      duration,
      budget,
      startDate,
      notes,
    } = body;

    if (!businessName || !contactEmail || !adPackage || !duration || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const advertisement = await db.advertisement.create({
      data: {
        businessName,
        businessId,
        contactEmail,
        contactPhone,
        package: adPackage,
        duration,
        budget,
        startDate: startDate ? new Date(startDate) : null,
        notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ advertisement }, { status: 201 });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}

// PUT - Update advertisement status/details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { advertisementId, status, adminNotes, impressions, clicks, conversions, startDate, endDate } = body;

    if (!advertisementId) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'ACTIVE' && !startDate) {
        updateData.startDate = new Date();
      }
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
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
    
    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }
    
    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }

    const advertisement = await db.advertisement.update({
      where: { id: advertisementId },
      data: updateData,
    });

    return NextResponse.json({ advertisement });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an advertisement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    await db.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to delete advertisement' },
      { status: 500 }
    );
  }
}
