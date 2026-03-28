import { NextRequest, NextResponse } from 'next/server';

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
};

export const authRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
};

export const apiRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'API rate limit exceeded. Please slow down.',
};

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig = defaultRateLimitConfig) {
  return (req: NextRequest): NextResponse | null => {
    const key = config.keyGenerator 
      ? config.keyGenerator(req) 
      : getClientIdentifier(req);
    
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (entry && entry.resetTime > now) {
      if (entry.count >= config.maxRequests) {
        return NextResponse.json(
          { 
            error: config.message || 'Rate limit exceeded',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
              'X-RateLimit-Limit': String(config.maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
            }
          }
        );
      }

      entry.count++;
      return null;
    }

    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    });

    return null;
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
  
  // Include user agent for more unique identification
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Create a hash-like identifier
  return `${ip}:${userAgent.slice(0, 50)}`;
}

// ============================================
// SECURITY HEADERS
// ============================================

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXssProtection?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

export const defaultSecurityHeaders: SecurityHeadersConfig = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://maps.googleapis.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  xXssProtection: '1; mode=block',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self https://js.stripe.com)',
  ].join(', '),
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(
  response: NextResponse, 
  config: SecurityHeadersConfig = defaultSecurityHeaders
): NextResponse {
  if (config.contentSecurityPolicy) {
    response.headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  }
  if (config.xFrameOptions) {
    response.headers.set('X-Frame-Options', config.xFrameOptions);
  }
  if (config.xContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', config.xContentTypeOptions);
  }
  if (config.xXssProtection) {
    response.headers.set('X-XSS-Protection', config.xXssProtection);
  }
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }
  if (config.permissionsPolicy) {
    response.headers.set('Permissions-Policy', config.permissionsPolicy);
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// ============================================
// CSRF PROTECTION
// ============================================

const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * Generate CSRF token
 */
export function generateCsrfToken(sessionId: string): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null;
  }

  const csrfToken = req.headers.get('X-CSRF-Token');
  const sessionId = req.cookies.get('session-id')?.value;

  if (!sessionId || !csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }

  if (!validateCsrfToken(sessionId, csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null;
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  } else {
    score++;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    // Not an error, just doesn't contribute to strength
  } else {
    score++;
  }

  const strength: 'weak' | 'fair' | 'good' | 'strong' = 
    score <= 2 ? 'weak' : score === 3 ? 'fair' : score === 4 ? 'good' : 'strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// ============================================
// COMBINED MIDDLEWARE
// ============================================

export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: RateLimitConfig;
    csrf?: boolean;
    securityHeaders?: boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting
    if (options.rateLimit) {
      const rateLimitResponse = rateLimit(options.rateLimit)(req);
      if (rateLimitResponse) return rateLimitResponse;
    }

    // Apply CSRF protection
    if (options.csrf) {
      const csrfResponse = csrfProtection(req);
      if (csrfResponse) return csrfResponse;
    }

    // Execute handler
    const response = await handler(req);

    // Add security headers
    if (options.securityHeaders !== false) {
      addSecurityHeaders(response);
    }

    return response;
  };
}
