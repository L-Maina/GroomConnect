import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession, createOTP } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { rateLimit, addSecurityHeaders, validatePasswordStrength } from '@/lib/security';

// Registration rate limiter - stricter than general API
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts. Please try again later.',
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = registerRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse('Invalid registration data', 400);
    }

    // Validate password strength on server side
    const passwordValidation = validatePasswordStrength(validated.data.password);
    if (!passwordValidation.isValid) {
      return errorResponse(passwordValidation.errors.join('. '), 400);
    }

    // Normalize email to lowercase
    const email = validated.data.email.toLowerCase();

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return generic message to prevent email enumeration
      return errorResponse('Unable to create account. Please try a different email.', 409);
    }

    // Check phone if provided
    if (validated.data.phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone: validated.data.phone },
      });
      if (existingPhone) {
        return errorResponse('This phone number is already registered', 409);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.data.password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name: validated.data.name,
        phone: validated.data.phone,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    // Create session
    await createSession(user);

    // If phone provided, send OTP
    if (validated.data.phone) {
      await createOTP(validated.data.phone);
    }

    const response = successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, 201);

    // Add security headers
    return addSecurityHeaders(response);
  } catch (error) {
    // Log error for monitoring
    console.error('Registration error:', error);
    return handleApiError(error);
  }
}
