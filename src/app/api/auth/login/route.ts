import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { rateLimit, authRateLimitConfig, addSecurityHeaders } from '@/lib/security';

// Rate limiter for login attempts
const loginRateLimiter = rateLimit(authRateLimitConfig);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = loginRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validated = loginSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse('Invalid email or password format', 400);
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: validated.data.email.toLowerCase() },
    });

    // Use generic error message to prevent user enumeration
    const genericError = 'Invalid email or password';

    if (!user || !user.password) {
      return errorResponse(genericError, 401);
    }

    // Check if user is active (if you have this field)
    // if (!user.isActive) {
    //   return errorResponse('Account is disabled. Please contact support.', 403);
    // }

    // Verify password
    const isValid = await verifyPassword(validated.data.password, user.password);
    if (!isValid) {
      return errorResponse(genericError, 401);
    }

    // Create session
    const token = await createSession(user);

    const response = successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    });

    // Add security headers
    return addSecurityHeaders(response);
  } catch (error) {
    // Log error for monitoring but return generic message
    console.error('Login error:', error);
    return handleApiError(error);
  }
}
