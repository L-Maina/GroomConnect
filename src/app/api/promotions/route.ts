import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// PROMOTIONS API
// Handles: Premium listings, featured providers, advertising
// ============================================

// GET /api/promotions - Fetch promotions data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'listings'; // listings, active, expired, business
    const businessId = searchParams.get('businessId');
    const promotionType = searchParams.get('promotionType'); // PROMOTED, FEATURED, MARKETING_BOOST

    switch (type) {
      case 'listings':
        return await getPromotionListings(promotionType);
      case 'active':
        return await getActivePromotions(businessId);
      case 'expired':
        return await getExpiredPromotions();
      case 'business':
        return await getBusinessPromotions(businessId);
      case 'featured':
        return await getFeaturedProviders();
      case 'packages':
        return await getPromotionPackages();
      default:
        return await getPromotionListings(promotionType);
    }
  } catch (error) {
    console.error('Promotions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions data' },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Purchase a promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessId, 
      promotionType, 
      duration, 
      price,
      boostLevel,
      section,
      channels,
      targetAudience,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!businessId || !promotionType || !duration || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Verify payment
    // 2. Create promotion record in database
    // 3. Update business visibility
    
    const promotion = {
      id: `promo-${Date.now()}`,
      businessId,
      type: promotionType,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      price,
      currency: 'KES',
      features: getFeaturesForType(promotionType),
      autoRenew: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Type-specific fields
      ...(promotionType === 'PROMOTED' && { boostLevel: boostLevel || 3 }),
      ...(promotionType === 'FEATURED' && { section: section || 'HOMEPAGE' }),
      ...(promotionType === 'MARKETING_BOOST' && { channels: channels || ['EMAIL'], targetAudience }),
      // Analytics
      analytics: {
        views: 0,
        clicks: 0,
        bookings: 0,
        revenue: 0,
      },
    };

    return NextResponse.json({
      success: true,
      promotion,
      message: 'Promotion purchased successfully',
      transactionId: `TXN-${Date.now()}`,
    });
  } catch (error) {
    console.error('Failed to create promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}

// PATCH /api/promotions - Update promotion
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { promotionId, action, data } = body;

    if (!promotionId || !action) {
      return NextResponse.json(
        { error: 'Promotion ID and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel':
        return await cancelPromotion(promotionId);
      case 'renew':
        return await renewPromotion(promotionId, data);
      case 'update':
        return await updatePromotion(promotionId, data);
      case 'toggle-auto-renew':
        return await toggleAutoRenew(promotionId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update promotion:', error);
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getPromotionListings(promotionType: string | null) {
  // Mock data - in production this would fetch from database
  const listings = [
    {
      id: 'promo-001',
      businessId: 'b1',
      businessName: 'Elite Cuts & Style',
      type: 'FEATURED',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      price: 99,
      section: 'HOMEPAGE',
      analytics: { views: 15420, clicks: 892, bookings: 45, revenue: 2250 },
      daysRemaining: 20,
    },
    {
      id: 'promo-002',
      businessId: 'b2',
      businessName: 'Glamour Beauty Spa',
      type: 'PROMOTED',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      price: 49,
      boostLevel: 3,
      analytics: { views: 8230, clicks: 412, bookings: 23, revenue: 1150 },
      daysRemaining: 25,
    },
    {
      id: 'promo-003',
      businessId: 'b3',
      businessName: 'Modern Barbershop',
      type: 'MARKETING_BOOST',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      price: 199,
      channels: ['EMAIL', 'SOCIAL'],
      analytics: { views: 5000, clicks: 250, bookings: 12, revenue: 600 },
      daysRemaining: 5,
    },
  ];

  let filtered = listings;
  if (promotionType) {
    filtered = listings.filter(l => l.type === promotionType);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

async function getActivePromotions(businessId: string | null) {
  const promotions = [
    {
      id: 'promo-001',
      businessId: 'b1',
      businessName: 'Elite Cuts & Style',
      type: 'FEATURED',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      price: 99,
      daysRemaining: 20,
      progress: 33,
      analytics: { views: 15420, clicks: 892, bookings: 45, revenue: 2250 },
    },
  ];

  let filtered = promotions;
  if (businessId) {
    filtered = promotions.filter(p => p.businessId === businessId);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

async function getExpiredPromotions() {
  const expired = [
    {
      id: 'promo-exp-001',
      businessId: 'b5',
      businessName: 'Style Studio',
      type: 'PROMOTED',
      status: 'EXPIRED',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      price: 49,
      analytics: { views: 25000, clicks: 1200, bookings: 65, revenue: 3250 },
      canRenew: true,
    },
  ];

  return NextResponse.json({
    success: true,
    data: expired,
    total: expired.length,
  });
}

async function getBusinessPromotions(businessId: string | null) {
  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID is required' },
      { status: 400 }
    );
  }

  const businessPromotions = {
    businessId,
    active: [
      {
        id: 'promo-001',
        type: 'FEATURED',
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        price: 99,
        daysRemaining: 20,
        analytics: { views: 15420, clicks: 892, bookings: 45, revenue: 2250 },
      },
    ],
    history: [
      {
        id: 'promo-hist-001',
        type: 'PROMOTED',
        status: 'EXPIRED',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        price: 49,
        analytics: { views: 18000, clicks: 850, bookings: 42, revenue: 2100 },
      },
    ],
    totalSpent: 247,
    currentROI: 22.7, // Revenue from promotions / Cost of promotions
    availablePackages: getAvailablePackages(),
  };

  return NextResponse.json({
    success: true,
    data: businessPromotions,
  });
}

async function getFeaturedProviders() {
  const featured = [
    {
      businessId: 'b1',
      businessName: 'Elite Cuts & Style',
      category: 'Haircuts & Styling',
      rating: 4.9,
      reviewCount: 245,
      image: '/images/business-1.jpg',
      promotedUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      badge: 'FEATURED',
    },
    {
      businessId: 'b2',
      businessName: 'Glamour Beauty Spa',
      category: 'Spa & Wellness',
      rating: 4.8,
      reviewCount: 189,
      image: '/images/business-2.jpg',
      promotedUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      badge: 'PROMOTED',
    },
  ];

  return NextResponse.json({
    success: true,
    data: featured,
    total: featured.length,
  });
}

async function getPromotionPackages() {
  const packages = [
    {
      id: 'PROMOTED',
      name: 'Promoted Listing',
      price: 29.99,
      duration: 30,
      description: 'Boost your visibility in search results',
      features: [
        'Up to 5x search ranking boost',
        'Priority placement in category',
        'Promoted badge on profile',
        'Basic analytics dashboard',
        'Target specific categories',
      ],
      icon: 'TrendingUp',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'FEATURED',
      name: 'Featured Spot',
      price: 59.99,
      duration: 30,
      description: 'Premium homepage and category spotlight',
      features: [
        'Homepage spotlight rotation',
        'Top 3 in category listings',
        'Featured badge with glow effect',
        'Advanced analytics & insights',
        'Unlimited category targeting',
        'Priority customer support',
      ],
      icon: 'Crown',
      gradient: 'from-amber-500 to-orange-500',
      popular: true,
    },
    {
      id: 'MARKETING_BOOST',
      name: 'Marketing Boost',
      price: 99.99,
      duration: 7,
      description: 'Multi-channel marketing campaign',
      features: [
        'Email blast to local customers',
        'Social media promotion',
        'Push notification campaign',
        'Detailed campaign analytics',
        'Audience targeting options',
        'A/B testing included',
      ],
      icon: 'Rocket',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return NextResponse.json({
    success: true,
    data: packages,
  });
}

async function cancelPromotion(promotionId: string) {
  // In production, this would update the database
  return NextResponse.json({
    success: true,
    message: 'Promotion cancelled successfully',
    promotionId,
    refundedAmount: 0, // No refund for cancellations
    cancelledAt: new Date(),
  });
}

async function renewPromotion(promotionId: string, data: any) {
  const { duration } = data || {};
  
  return NextResponse.json({
    success: true,
    message: 'Promotion renewed successfully',
    promotionId,
    newEndDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000),
    renewedAt: new Date(),
  });
}

async function updatePromotion(promotionId: string, data: any) {
  return NextResponse.json({
    success: true,
    message: 'Promotion updated successfully',
    promotionId,
    updatedAt: new Date(),
    changes: data,
  });
}

async function toggleAutoRenew(promotionId: string) {
  return NextResponse.json({
    success: true,
    message: 'Auto-renew toggled',
    promotionId,
    autoRenew: true,
    updatedAt: new Date(),
  });
}

function getFeaturesForType(type: string) {
  const features: Record<string, { name: string; description: string; included: boolean }[]> = {
    PROMOTED: [
      { name: 'Search Boost', description: 'Up to 5x ranking boost', included: true },
      { name: 'Promoted Badge', description: 'Promoted badge on profile', included: true },
      { name: 'Basic Analytics', description: 'View basic performance metrics', included: true },
      { name: 'Category Targeting', description: 'Target up to 3 categories', included: true },
    ],
    FEATURED: [
      { name: 'Homepage Spotlight', description: 'Rotation on homepage', included: true },
      { name: 'Top 3 Placement', description: 'Top 3 in category listings', included: true },
      { name: 'Featured Badge', description: 'Premium featured badge', included: true },
      { name: 'Advanced Analytics', description: 'Detailed performance insights', included: true },
      { name: 'Priority Support', description: '24/7 priority support', included: true },
    ],
    MARKETING_BOOST: [
      { name: 'Email Campaign', description: 'Email blast to local customers', included: true },
      { name: 'Social Promotion', description: 'Social media promotion', included: true },
      { name: 'Push Notifications', description: 'Mobile push notifications', included: true },
      { name: 'Campaign Analytics', description: 'Detailed campaign metrics', included: true },
      { name: 'A/B Testing', description: 'Test different creatives', included: true },
    ],
  };
  
  return features[type] || features.PROMOTED;
}

function getAvailablePackages() {
  return [
    { id: 'weekly', name: 'Weekly', duration: 7, discount: 0 },
    { id: 'monthly', name: 'Monthly', duration: 30, discount: 10 },
    { id: 'quarterly', name: 'Quarterly', duration: 90, discount: 20 },
  ];
}
