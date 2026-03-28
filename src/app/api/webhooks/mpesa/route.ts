import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, handleApiError } from '@/lib/api-utils';

// M-Pesa (Safaricom Daraja) callback URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // M-Pesa callback structure
    const { Body } = body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Find payment by checkout request ID
    const payment = await db.payment.findFirst({
      where: { transactionId: CheckoutRequestID },
    });

    if (!payment) {
      return successResponse({ received: true, error: 'Payment not found' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadata.find((item: { Name: string }) => item.Name === 'MpesaReceiptNumber')?.Value;

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: mpesaReceiptNumber || CheckoutRequestID,
          metadata: JSON.stringify(body),
        },
      });

      await db.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      await db.notification.create({
        data: {
          userId: payment.userId,
          title: 'M-Pesa Payment Successful',
          message: `Your M-Pesa payment of KES ${payment.amount} was successful`,
          type: 'PAYMENT_SUCCESS',
        },
      });
    } else {
      // Payment failed
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: JSON.stringify({ ResultCode, ResultDesc }),
        },
      });

      await db.notification.create({
        data: {
          userId: payment.userId,
          title: 'M-Pesa Payment Failed',
          message: ResultDesc || 'Your M-Pesa payment failed',
          type: 'PAYMENT_FAILED',
        },
      });
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
