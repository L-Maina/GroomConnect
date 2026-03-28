import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all banned/suspended users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // appeal status
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      where.appealStatus = status;
    }

    const bans = await db.userBan.findMany({
      where,
      orderBy: { bannedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.userBan.count({ where });

    // Calculate stats
    const stats = {
      total: await db.userBan.count(),
      pendingAppeals: await db.userBan.count({ where: { appealStatus: 'PENDING' } }),
      permanentBans: await db.userBan.count({ where: { isPermanent: true } }),
      temporarySuspensions: await db.userBan.count({ where: { isPermanent: false } }),
    };

    return NextResponse.json({
      bans,
      total,
      stats,
      hasMore: offset + bans.length < total,
    });
  } catch (error) {
    console.error('Error fetching bans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bans' },
      { status: 500 }
    );
  }
}

// PUT - Update ban (handle appeal, unblock, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { banId, action, adminNotes, newEndDate } = body;

    if (!banId || !action) {
      return NextResponse.json(
        { error: 'Ban ID and action are required' },
        { status: 400 }
      );
    }

    const ban = await db.userBan.findUnique({
      where: { id: banId },
    });

    if (!ban) {
      return NextResponse.json(
        { error: 'Ban not found' },
        { status: 404 }
      );
    }

    if (action === 'unblock') {
      // Delete the ban record
      await db.userBan.delete({
        where: { id: banId },
      });

      return NextResponse.json({ success: true, message: 'User unblocked successfully' });
    }

    const updateData: Record<string, unknown> = {};
    
    if (action === 'approveAppeal') {
      updateData.appealStatus = 'APPROVED';
      updateData.appealResolvedAt = new Date();
      // Also unblock
      await db.userBan.delete({
        where: { id: banId },
      });
      return NextResponse.json({ success: true, message: 'Appeal approved and user unblocked' });
    }
    
    if (action === 'rejectAppeal') {
      updateData.appealStatus = 'REJECTED';
      updateData.appealResolvedAt = new Date();
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    if (newEndDate) {
      updateData.endDate = new Date(newEndDate);
    }

    const updatedBan = await db.userBan.update({
      where: { id: banId },
      data: updateData,
    });

    return NextResponse.json({ ban: updatedBan });
  } catch (error) {
    console.error('Error updating ban:', error);
    return NextResponse.json(
      { error: 'Failed to update ban' },
      { status: 500 }
    );
  }
}

// POST - Submit an appeal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, appealReason } = body;

    if (!userId || !appealReason) {
      return NextResponse.json(
        { error: 'User ID and appeal reason are required' },
        { status: 400 }
      );
    }

    const ban = await db.userBan.findUnique({
      where: { userId },
    });

    if (!ban) {
      return NextResponse.json(
        { error: 'No active ban found for this user' },
        { status: 404 }
      );
    }

    const updatedBan = await db.userBan.update({
      where: { userId },
      data: {
        appealStatus: 'PENDING',
        appealReason,
        appealDate: new Date(),
      },
    });

    return NextResponse.json({ ban: updatedBan });
  } catch (error) {
    console.error('Error submitting appeal:', error);
    return NextResponse.json(
      { error: 'Failed to submit appeal' },
      { status: 500 }
    );
  }
}
