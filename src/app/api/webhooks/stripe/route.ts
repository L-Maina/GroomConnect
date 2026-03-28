import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // In production, verify webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // For now, parse the body directly
    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const payment = await db.payment.findFirst({
          where: { transactionId: paymentIntent.id },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });

          await db.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });

          // Create notification
          await db.notification.create({
            data: {
              userId: payment.userId,
              title: 'Payment Successful',
              message: `Your payment of ${payment.currency} ${payment.amount} was successful`,
              type: 'PAYMENT_SUCCESS',
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const payment = await db.payment.findFirst({
          where: { transactionId: paymentIntent.id },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });

          await db.notification.create({
            data: {
              userId: payment.userId,
              title: 'Payment Failed',
              message: `Your payment of ${payment.currency} ${payment.amount} failed`,
              type: 'PAYMENT_FAILED',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
