import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all insurance claims
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

    const claims = await db.insuranceClaim.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.insuranceClaim.count({ where });

    // Calculate stats
    const stats = {
      submitted: await db.insuranceClaim.count({ where: { status: 'SUBMITTED' } }),
      underReview: await db.insuranceClaim.count({ where: { status: 'UNDER_REVIEW' } }),
      approved: await db.insuranceClaim.count({ where: { status: 'APPROVED' } }),
      rejected: await db.insuranceClaim.count({ where: { status: 'REJECTED' } }),
      paid: await db.insuranceClaim.count({ where: { status: 'PAID' } }),
      totalPaid: await db.insuranceClaim.aggregate({
        where: { status: { in: ['APPROVED', 'PAID'] } },
        _sum: { amount: true },
      }),
    };

    return NextResponse.json({
      claims,
      total,
      stats,
      hasMore: offset + claims.length < total,
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

// POST - Create a new insurance claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerEmail,
      providerId,
      providerName,
      bookingId,
      type,
      description,
      amount,
      currency,
      documents,
      incidentDate,
    } = body;

    if (!customerName || !customerEmail || !type || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate claim number
    const claimCount = await db.insuranceClaim.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(claimCount + 1).padStart(3, '0')}`;

    const claim = await db.insuranceClaim.create({
      data: {
        claimNumber,
        customerId,
        customerName,
        customerEmail,
        providerId,
        providerName,
        bookingId,
        type,
        description,
        amount,
        currency: currency || 'USD',
        documents: documents ? JSON.stringify(documents) : null,
        incidentDate: new Date(incidentDate),
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}

// PUT - Update claim status/details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, status, adminNotes, resolution, reviewedBy } = body;

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = reviewedBy;
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    if (resolution !== undefined) {
      updateData.resolution = resolution;
    }

    const claim = await db.insuranceClaim.update({
      where: { id: claimId },
      data: updateData,
    });

    return NextResponse.json({ claim });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}
