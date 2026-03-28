import { z } from 'zod';

// Auth validations
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// Business validations
export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  serviceRadius: z.number().min(1).max(100).default(10),
});

export const updateBusinessSchema = createBusinessSchema.partial();

// Service validations
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
  price: z.number().min(0, 'Price must be non-negative'),
  discountPrice: z.number().min(0).optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// TimeSlot validations
export const createTimeSlotSchema = z.object({
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end time format'),
});

// Booking validations
export const createBookingSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  staffId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end time format'),
  notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z.string().max(500).optional(),
});

// Payment validations
export const createPaymentSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'MPESA']),
});

// Review validations
export const createReviewSchema = z.object({
  businessId: z.string(),
  bookingId: z.string(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

// Staff validations
export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// Portfolio validations
export const createPortfolioSchema = z.object({
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

// Chat validations
export const sendMessageSchema = z.object({
  conversationId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

export const createConversationSchema = z.object({
  businessId: z.string(),
});

// Notification validations
export const markNotificationReadSchema = z.object({
  notificationId: z.string(),
});

// Admin validations
export const updateBusinessStatusSchema = z.object({
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().max(500).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema
export const searchBusinessSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().min(0).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).max(100).optional(),
  ...paginationSchema.shape,
});

// ID validation
export const idSchema = z.object({
  id: z.string(),
});
