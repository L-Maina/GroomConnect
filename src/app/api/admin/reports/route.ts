import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }

    const reports = await db.adminReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.adminReport.count({ where });

    // Calculate stats
    const stats = {
      pending: await db.adminReport.count({ where: { status: 'PENDING' } }),
      investigating: await db.adminReport.count({ where: { status: 'INVESTIGATING' } }),
      resolved: await db.adminReport.count({ where: { status: 'RESOLVED' } }),
      dismissed: await db.adminReport.count({ where: { status: 'DISMISSED' } }),
    };

    return NextResponse.json({
      reports,
      total,
      stats,
      hasMore: offset + reports.length < total,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reporterId,
      reporterName,
      reporterEmail,
      reportedUserId,
      reportedUserName,
      reportedUserEmail,
      type,
      reason,
      description,
      evidence,
    } = body;

    if (!reporterName || !reporterEmail || !type || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await db.adminReport.create({
      data: {
        reporterId,
        reporterName,
        reporterEmail,
        reportedUserId,
        reportedUserName,
        reportedUserEmail,
        type,
        reason,
        description,
        evidence: evidence ? JSON.stringify(evidence) : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// PUT - Update report status/action
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, status, action, adminNotes } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'DISMISSED') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (action) {
      updateData.action = action;
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const report = await db.adminReport.update({
      where: { id: reportId },
      data: updateData,
    });

    // If action is ban or suspend, create ban record
    if (action === 'BAN' || action === 'SUSPENSION') {
      const reportedUser = await db.user.findUnique({
        where: { id: report.reportedUserId || '' },
      });

      if (reportedUser) {
        await db.userBan.upsert({
          where: { userId: reportedUser.id },
          create: {
            userId: reportedUser.id,
            userName: reportedUser.name || 'Unknown',
            userEmail: reportedUser.email,
            bannedBy: 'admin',
            reason: report.reason,
            type: action === 'BAN' ? 'BAN' : 'SUSPENSION',
            isPermanent: action === 'BAN',
          },
          update: {
            reason: report.reason,
            type: action === 'BAN' ? 'BAN' : 'SUSPENSION',
            isPermanent: action === 'BAN',
          },
        });
      }
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
