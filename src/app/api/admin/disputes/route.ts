import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all disputes
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

    const disputes = await db.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.dispute.count({ where });

    // Calculate stats
    const stats = {
      open: await db.dispute.count({ where: { status: 'OPEN' } }),
      inProgress: await db.dispute.count({ where: { status: 'IN_PROGRESS' } }),
      resolved: await db.dispute.count({ where: { status: 'RESOLVED' } }),
      totalAmount: await db.dispute.aggregate({
        _sum: { amount: true },
      }),
    };

    return NextResponse.json({
      disputes,
      total,
      stats,
      hasMore: offset + disputes.length < total,
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      customerId,
      customerName,
      providerId,
      providerName,
      type,
      description,
      amount,
    } = body;

    if (!customerName || !providerName || !type || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dispute = await db.dispute.create({
      data: {
        bookingId,
        customerId,
        customerName,
        providerId,
        providerName,
        type,
        description,
        amount,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}

// PUT - Update dispute status/resolution
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { disputeId, status, resolution } = body;

    if (!disputeId) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (resolution !== undefined) {
      updateData.resolution = JSON.stringify(resolution);
    }

    const dispute = await db.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });

    // If resolution involves refund, process it
    if (resolution && resolution.type === 'FULL_REFUND') {
      // Find the payment and mark as refunded
      if (dispute.bookingId) {
        await db.payment.updateMany({
          where: { bookingId: dispute.bookingId },
          data: { status: 'REFUNDED' },
        });
      }
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dispute
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    await db.dispute.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dispute:', error);
    return NextResponse.json(
      { error: 'Failed to delete dispute' },
      { status: 500 }
    );
  }
}
