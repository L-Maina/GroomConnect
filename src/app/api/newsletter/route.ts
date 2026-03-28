import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.formSubmission.findFirst({
      where: {
        type: 'NEWSLETTER',
        email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email is already subscribed' },
        { status: 400 }
      );
    }

    const subscription = await db.formSubmission.create({
      data: {
        type: 'NEWSLETTER',
        email,
        status: 'PENDING',
      },
    });

    // Create admin notification
    await db.notification.create({
      data: {
        userId: 'admin',
        title: 'New Newsletter Subscription',
        message: `${email} has subscribed to the newsletter`,
        type: 'SYSTEM_ALERT',
        data: JSON.stringify({ email, subscriptionId: subscription.id }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
