import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { randomBytes } from 'crypto';

// In production, store these in database with expiration
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({ message: 'If an account exists, you will receive a reset email' });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    resetTokens.set(token, {
      email: validated.email,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    // In production, send email with reset link
    // For now, return token (REMOVE IN PRODUCTION)
    console.log(`Reset token for ${validated.email}: ${token}`);

    return successResponse({
      message: 'If an account exists, you will receive a reset email',
      // Remove this in production:
      _devToken: process.env.NODE_ENV === 'development' ? token : undefined,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export { resetTokens };
