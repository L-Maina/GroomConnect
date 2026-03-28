import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET blocked users for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const blockedUsers = await db.blockedUser.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get details of blocked users
    const blockedUserDetails = await Promise.all(
      blockedUsers.map(async (block) => {
        const blockedUser = await db.user.findUnique({
          where: { id: block.blockedId },
          select: { id: true, name: true, avatar: true, email: true },
        });
        return {
          ...block,
          blockedUser,
        };
      })
    );

    return NextResponse.json({ blockedUsers: blockedUserDetails });
  } catch (error) {
    console.error('Fetch blocked users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}

// POST to block a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, blockedId, reason } = body;

    if (!userId || !blockedId) {
      return NextResponse.json(
        { error: 'User ID and blocked ID are required' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existing = await db.blockedUser.findUnique({
      where: {
        userId_blockedId: { userId, blockedId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 }
      );
    }

    const blockedUser = await db.blockedUser.create({
      data: {
        userId,
        blockedId,
        reason: reason || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
      blockedUser,
    });
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE to unblock a user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, blockedId } = body;

    if (!userId || !blockedId) {
      return NextResponse.json(
        { error: 'User ID and blocked ID are required' },
        { status: 400 }
      );
    }

    await db.blockedUser.delete({
      where: {
        userId_blockedId: { userId, blockedId },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}
