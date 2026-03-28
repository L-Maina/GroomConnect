import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, subject, message, category, userId, metadata } = body;

    // Validate required fields based on type
    if (!type) {
      return NextResponse.json(
        { error: 'Submission type is required' },
        { status: 400 }
      );
    }

    // Create the form submission
    const submission = await db.formSubmission.create({
      data: {
        type,
        name: name || null,
        email: email || null,
        phone: phone || null,
        subject: subject || null,
        message: message || null,
        category: category || null,
        userId: userId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: 'PENDING',
      },
    });

    // Create admin notification for new submission
    await db.notification.create({
      data: {
        userId: 'admin', // System notification for admins
        title: `New ${type.toLowerCase()} submission`,
        message: subject || message?.substring(0, 100) || 'New form submission received',
        type: 'SYSTEM_ALERT',
        data: JSON.stringify({ submissionId: submission.id, type }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received successfully',
      id: submission.id,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const submissions = await db.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.formSubmission.count({ where });

    return NextResponse.json({
      submissions,
      total,
      hasMore: offset + submissions.length < total,
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
