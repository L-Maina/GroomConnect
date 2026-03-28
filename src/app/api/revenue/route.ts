import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// REVENUE API
// Handles: Revenue metrics, transactions, analytics
// ============================================

// GET /api/revenue - Fetch revenue data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview'; // overview, transactions, metrics, breakdown
    const period = searchParams.get('period') || 'monthly';
    const businessId = searchParams.get('businessId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (type) {
      case 'overview':
        return await getRevenueOverview(period);
      case 'transactions':
        return await getTransactions(businessId, startDate, endDate);
      case 'metrics':
        return await getRevenueMetrics();
      case 'breakdown':
        return await getRevenueBreakdown(period, startDate, endDate);
      case 'business':
        return await getBusinessRevenue(businessId);
      default:
        return await getRevenueOverview(period);
    }
  } catch (error) {
    console.error('Revenue API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

// POST /api/revenue - Record transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      bookingId, 
      businessId, 
      userId, 
      amount, 
      platformFee,
      providerAmount,
      paymentMethod,
      metadata 
    } = body;

    // In a real implementation, this would create a transaction record in the database
    // For now, we'll return a mock response
    
    const transaction = {
      id: `txn-${Date.now()}`,
      type: type || 'BOOKING_COMMISSION',
      bookingId,
      businessId,
      userId,
      amount,
      platformFee,
      providerAmount,
      currency: 'KES',
      status: 'COMPLETED',
      paymentMethod,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Failed to record transaction:', error);
    return NextResponse.json(
      { error: 'Failed to record transaction' },
      { status: 500 }
    );
  }
}

// PATCH /api/revenue - Update platform fee settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { platformFee, categoryRates, businessRates } = body;

    // In a real implementation, this would update the platform settings
    // For now, we'll return a mock response
    
    return NextResponse.json({
      success: true,
      settings: {
        platformFee: platformFee || 15,
        categoryRates: categoryRates || {},
        businessRates: businessRates || {},
        updatedAt: new Date(),
      },
      message: 'Revenue settings updated successfully'
    });
  } catch (error) {
    console.error('Failed to update revenue settings:', error);
    return NextResponse.json(
      { error: 'Failed to update revenue settings' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getRevenueOverview(period: string) {
  // Mock data - in production this would fetch from database
  const now = new Date();
  const periods: Record<string, { start: Date; end: Date }> = {
    daily: { 
      start: new Date(now.setDate(now.getDate() - 1)), 
      end: new Date() 
    },
    weekly: { 
      start: new Date(now.setDate(now.getDate() - 7)), 
      end: new Date() 
    },
    monthly: { 
      start: new Date(now.setMonth(now.getMonth() - 1)), 
      end: new Date() 
    },
    yearly: { 
      start: new Date(now.setFullYear(now.getFullYear() - 1)), 
      end: new Date() 
    },
  };

  const dateRange = periods[period] || periods.monthly;

  const overview = {
    period,
    dateRange,
    totalRevenue: 125000,
    commissionRevenue: 18750,
    premiumListingRevenue: 4500,
    marketingBoostRevenue: 2500,
    subscriptionRevenue: 0,
    refundAmount: 500,
    netRevenue: 25250,
    totalTransactions: 450,
    averageTransactionValue: 278,
    revenueGrowth: 12.5,
    topCategories: [
      { category: 'Haircuts & Styling', revenue: 45000, transactions: 180, growth: 15.2 },
      { category: 'Beard Grooming', revenue: 28000, transactions: 120, growth: 8.5 },
      { category: 'Spa & Wellness', revenue: 22000, transactions: 85, growth: 22.1 },
      { category: 'Nail Services', revenue: 18000, transactions: 65, growth: 5.2 },
    ],
    topBusinesses: [
      { businessId: 'b1', name: 'Elite Cuts & Style', revenue: 12500, transactions: 50, growth: 18.5 },
      { businessId: 'b2', name: 'Glamour Beauty Spa', revenue: 9800, transactions: 42, growth: 12.3 },
      { businessId: 'b3', name: 'Modern Barbershop', revenue: 7650, transactions: 35, growth: -2.1 },
    ],
    chartData: generateChartData(period),
  };

  return NextResponse.json({ success: true, data: overview });
}

async function getTransactions(businessId: string | null, startDate: string | null, endDate: string | null) {
  // Mock transactions data
  const transactions = [
    {
      id: 'txn-001',
      type: 'BOOKING_COMMISSION',
      businessId: 'b1',
      businessName: 'Elite Cuts & Style',
      amount: 150,
      platformFee: 22.50,
      providerAmount: 127.50,
      status: 'COMPLETED',
      paymentMethod: 'MPESA',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'txn-002',
      type: 'PREMIUM_LISTING',
      businessId: 'b2',
      businessName: 'Glamour Beauty Spa',
      amount: 99,
      platformFee: 99,
      providerAmount: 0,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: 'txn-003',
      type: 'BOOKING_COMMISSION',
      businessId: 'b3',
      businessName: 'Modern Barbershop',
      amount: 75,
      platformFee: 11.25,
      providerAmount: 63.75,
      status: 'COMPLETED',
      paymentMethod: 'MPESA',
      createdAt: new Date(Date.now() - 259200000),
    },
    {
      id: 'txn-004',
      type: 'MARKETING_BOOST',
      businessId: 'b1',
      businessName: 'Elite Cuts & Style',
      amount: 199,
      platformFee: 199,
      providerAmount: 0,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: new Date(Date.now() - 345600000),
    },
    {
      id: 'txn-005',
      type: 'REFUND',
      businessId: 'b4',
      businessName: 'Style Studio',
      amount: 50,
      platformFee: -7.50,
      providerAmount: 0,
      status: 'COMPLETED',
      paymentMethod: 'MPESA',
      createdAt: new Date(Date.now() - 432000000),
    },
  ];

  let filtered = transactions;

  if (businessId) {
    filtered = filtered.filter(t => t.businessId === businessId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filtered = filtered.filter(t => {
      const date = new Date(t.createdAt);
      return date >= start && date <= end;
    });
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

async function getRevenueMetrics() {
  const metrics = {
    totalRevenue: 125000,
    totalTransactions: 450,
    averageTransactionValue: 278,
    commissionRate: 15,
    grossMargin: 85,
    revenueGrowth: 12.5,
    monthlyRecurringRevenue: 3500,
    annualRecurringRevenue: 42000,
    activePremiumListings: 12,
    pendingPayouts: 8,
    totalPayoutsAmount: 45000,
    escrowBalance: 12500,
  };

  return NextResponse.json({ success: true, data: metrics });
}

async function getRevenueBreakdown(period: string, startDate: string | null, endDate: string | null) {
  const breakdown = {
    period,
    startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: endDate || new Date().toISOString(),
    byType: {
      bookingCommission: { amount: 18750, percentage: 74.3 },
      premiumListing: { amount: 4500, percentage: 17.8 },
      marketingBoost: { amount: 2500, percentage: 9.9 },
      subscription: { amount: 0, percentage: 0 },
    },
    byCategory: [
      { category: 'Haircuts & Styling', amount: 6750, transactions: 180, percentage: 36 },
      { category: 'Beard Grooming', amount: 4200, transactions: 120, percentage: 22.4 },
      { category: 'Spa & Wellness', amount: 3300, transactions: 85, percentage: 17.6 },
      { category: 'Nail Services', amount: 2700, transactions: 65, percentage: 14.4 },
      { category: 'Skin Care', amount: 1800, transactions: 50, percentage: 9.6 },
    ],
    byPaymentMethod: {
      mpesa: { amount: 75000, transactions: 270, percentage: 60 },
      card: { amount: 35000, transactions: 125, percentage: 28 },
      paypal: { amount: 15000, transactions: 55, percentage: 12 },
    },
    growth: {
      revenueGrowth: 12.5,
      transactionGrowth: 8.3,
      averageOrderGrowth: 3.8,
    },
  };

  return NextResponse.json({ success: true, data: breakdown });
}

async function getBusinessRevenue(businessId: string | null) {
  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID is required' },
      { status: 400 }
    );
  }

  // Mock business-specific revenue data
  const businessRevenue = {
    businessId,
    totalEarnings: 52000,
    pendingBalance: 3500,
    availableBalance: 12500,
    totalCommissionPaid: 7800,
    totalPayouts: 28200,
    lastPayout: {
      id: 'payout-001',
      amount: 5000,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    nextPayout: {
      estimatedAmount: 4200,
      estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    premiumListings: {
      active: 2,
      totalSpent: 198,
      currentPlan: 'FEATURED',
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    recentTransactions: [
      {
        id: 'txn-001',
        type: 'BOOKING',
        amount: 150,
        commission: 22.50,
        netAmount: 127.50,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'txn-002',
        type: 'BOOKING',
        amount: 75,
        commission: 11.25,
        netAmount: 63.75,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
  };

  return NextResponse.json({ success: true, data: businessRevenue });
}

function generateChartData(period: string) {
  const dataPoints = period === 'daily' ? 24 : period === 'weekly' ? 7 : period === 'yearly' ? 12 : 30;
  
  return Array.from({ length: dataPoints }, (_, i) => ({
    date: new Date(Date.now() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 2000,
    transactions: Math.floor(Math.random() * 50) + 10,
    commission: Math.floor(Math.random() * 750) + 300,
  }));
}
