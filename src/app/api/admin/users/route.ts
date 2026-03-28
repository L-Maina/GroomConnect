import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (role && role !== 'all') {
      where.role = role;
    }

    // Get users with their business info
    const users = await db.user.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
            totalEarnings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Calculate total spent for customers
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await db.payment.aggregate({
          where: {
            userId: user.id,
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        });

        // Check if user is banned
        const ban = await db.userBan.findUnique({
          where: { userId: user.id },
        });

        return {
          ...user,
          totalSpent: totalSpent._sum.amount || 0,
          totalEarnings: user.business?.totalEarnings || 0,
          status: ban ? (ban.isPermanent ? 'BANNED' : 'SUSPENDED') : 'ACTIVE',
          roles: user.role === 'BUSINESS_OWNER' ? ['CUSTOMER', 'BUSINESS_OWNER'] : [user.role],
        };
      })
    );

    const total = await db.user.count({ where });

    return NextResponse.json({
      users: usersWithStats,
      total,
      hasMore: offset + users.length < total,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT - Update user status (suspend/activate)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, reason, adminId, duration } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'suspend' || action === 'ban') {
      // Create or update ban record
      const endDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
      
      await db.userBan.upsert({
        where: { userId },
        create: {
          userId,
          userName: user.name || 'Unknown',
          userEmail: user.email,
          bannedBy: adminId,
          reason: reason || 'No reason provided',
          type: action === 'ban' ? 'BAN' : 'SUSPENSION',
          isPermanent: action === 'ban',
          endDate,
        },
        update: {
          bannedBy: adminId,
          reason: reason || 'No reason provided',
          type: action === 'ban' ? 'BAN' : 'SUSPENSION',
          isPermanent: action === 'ban',
          endDate,
          appealStatus: 'NONE',
        },
      });
    } else if (action === 'activate') {
      // Remove ban record
      await db.userBan.delete({
        where: { userId },
      }).catch(() => {
        // User might not have a ban record, ignore error
      });
    } else if (action === 'updateRole') {
      const { newRole } = body;
      if (!newRole) {
        return NextResponse.json(
          { error: 'New role is required' },
          { status: 400 }
        );
      }
      
      await db.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
    }

    return NextResponse.json({ success: true, message: `User ${action} successful` });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
