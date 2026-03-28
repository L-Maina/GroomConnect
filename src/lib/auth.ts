import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { cookies } from 'next/headers';
import { User, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'groomconnect-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Session management
export async function createSession(user: User): Promise<string> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
    },
  });

  return user;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// Auth middleware helpers
export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole('ADMIN');
}

export async function requireBusinessOwner(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== 'BUSINESS_OWNER' && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}

// OTP utilities
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(phone: string): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete existing OTPs for this phone
  await db.oTPVerification.deleteMany({
    where: { phone },
  });

  // Create new OTP
  await db.oTPVerification.create({
    data: {
      phone,
      code,
      expiresAt,
    },
  });

  return code;
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const otp = await db.oTPVerification.findFirst({
    where: {
      phone,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  // Mark as used
  await db.oTPVerification.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  return true;
}

// Permission helpers
export function canManageBusiness(user: AuthUser, businessOwnerId: string): boolean {
  return user.role === 'ADMIN' || user.id === businessOwnerId;
}

export function canViewBooking(user: AuthUser, bookingCustomerId: string, bookingBusinessId: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (user.role === 'ADMIN') {
      resolve(true);
      return;
    }
    if (user.id === bookingCustomerId) {
      resolve(true);
      return;
    }
    // Check if user owns the business
    const business = await db.business.findUnique({
      where: { id: bookingBusinessId },
      select: { ownerId: true },
    });
    resolve(business?.ownerId === user.id);
  });
}
