import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { resetTokens } from '../forgot-password/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // Verify token
    const tokenData = resetTokens.get(validated.token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(validated.password);

    // Update user password
    await db.user.update({
      where: { email: tokenData.email },
      data: { password: hashedPassword },
    });

    // Remove used token
    resetTokens.delete(validated.token);

    return successResponse({ message: 'Password reset successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
