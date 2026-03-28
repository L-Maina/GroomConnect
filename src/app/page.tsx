'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedBusinesses } from '@/components/home/FeaturedBusinesses';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { CTASection } from '@/components/home/CTASection';
import { MapPage } from '@/components/map/MapPage';
import { MarketplacePage } from '@/components/marketplace/MarketplacePage';
import { BusinessProfilePage } from '@/components/business/BusinessProfilePage';
import { BookingPage } from '@/components/booking/BookingPage';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { BusinessDashboard } from '@/components/dashboard/BusinessDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AuthPage } from '@/components/auth/AuthPage';
import { AuthPromptModal } from '@/components/auth/AuthPromptModal';
import { ProviderOnboarding } from '@/components/onboarding/ProviderOnboarding';
import { ChatPage } from '@/components/chat/ChatPage';
import { PaymentCheckout } from '@/components/payment/PaymentSystem';
import { BookingCalendar } from '@/components/calendar/BookingCalendar';
import { DisputeCenter } from '@/components/disputes/DisputeSystem';
import { AboutPage } from '@/components/pages/AboutPage';
import { PrivacyPage } from '@/components/pages/PrivacyPage';
import { TermsPage } from '@/components/pages/TermsPage';
import { SupportPage } from '@/components/pages/SupportPage';
import { SafetyPage } from '@/components/pages/SafetyPage';
import { BlogPage } from '@/components/pages/BlogPage';
import { AdvertisePage } from '@/components/pages/AdvertisePage';
import { InsuranceClaimsPage } from '@/components/pages/InsuranceClaimsPage';
import { useAuthStore, useAdminStore } from '@/store';
import type { Business, Service } from '@/types';

// Sample data for demo
const sampleBusinesses: Business[] = [
  {
    id: '1',
    ownerId: 'owner1',
    name: 'Elite Cuts & Style',
    slug: 'elite-cuts-style',
    description: 'Premium barbershop offering modern cuts, beard grooming, and style consultations.',
    logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=400&fit=crop',
    phone: '+254 712 345 678',
    email: 'contact@elitecuts.com',
    address: '123 Style Avenue',
    city: 'Nairobi',
    country: 'Kenya',
    latitude: -1.2921,
    longitude: 36.8219,
    serviceRadius: 10,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'FEATURED',
    rating: 4.9,
    reviewCount: 328,
    totalEarnings: 125000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's1', businessId: '1', name: 'Classic Haircut', description: 'Traditional cut with modern finish', category: 'Haircuts & Styling', duration: 30, price: 35, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's2', businessId: '1', name: 'Beard Trim', description: 'Expert beard shaping and grooming', category: 'Beard Grooming', duration: 20, price: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's3', businessId: '1', name: 'Hot Towel Shave', description: 'Luxury straight razor shave', category: 'Beard Grooming', duration: 30, price: 45, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [
      { id: 'st1', businessId: '1', name: 'Marcus Johnson', role: 'Master Barber', bio: '15 years experience', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    reviews: [],
  },
  {
    id: '2',
    ownerId: 'owner2',
    name: 'Glamour Studio',
    slug: 'glamour-studio',
    description: 'Full-service beauty salon specializing in hair coloring and styling.',
    logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop',
    phone: '+254 723 456 789',
    email: 'hello@glamourstudio.com',
    address: '456 Beauty Lane',
    city: 'Nairobi',
    country: 'Kenya',
    latitude: -1.2864,
    longitude: 36.8172,
    serviceRadius: 15,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'PREMIUM',
    rating: 4.8,
    reviewCount: 256,
    totalEarnings: 98000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's4', businessId: '2', name: 'Hair Coloring', description: 'Full color transformation', category: 'Hair Coloring', duration: 120, price: 150, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's5', businessId: '2', name: 'Blowout', description: 'Professional blowout styling', category: 'Haircuts & Styling', duration: 45, price: 55, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [],
    reviews: [],
  },
  {
    id: '3',
    ownerId: 'owner3',
    name: 'Nail Art Paradise',
    slug: 'nail-art-paradise',
    description: 'Creative nail designs and premium nail care services.',
    logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=400&fit=crop',
    phone: '+254 733 567 890',
    email: 'book@nailartparadise.com',
    address: '789 Nail Street',
    city: 'Mombasa',
    country: 'Kenya',
    latitude: -4.0435,
    longitude: 39.6682,
    serviceRadius: 8,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'FREE',
    rating: 4.7,
    reviewCount: 189,
    totalEarnings: 45000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's6', businessId: '3', name: 'Gel Manicure', description: 'Long-lasting gel polish', category: 'Nail Services', duration: 45, price: 40, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's7', businessId: '3', name: 'Nail Art', description: 'Custom nail designs', category: 'Nail Services', duration: 60, price: 60, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [],
    reviews: [],
  },
  {
    id: '4',
    ownerId: 'owner4',
    name: 'Serenity Spa',
    slug: 'serenity-spa',
    description: 'Relaxing spa treatments and wellness services.',
    logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=400&fit=crop',
    phone: '+254 744 678 901',
    email: 'relax@serenityspa.com',
    address: '321 Wellness Blvd',
    city: 'Kisumu',
    country: 'Kenya',
    latitude: -0.1022,
    longitude: 34.7617,
    serviceRadius: 12,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'PREMIUM',
    rating: 4.9,
    reviewCount: 412,
    totalEarnings: 180000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's8', businessId: '4', name: 'Swedish Massage', description: 'Classic relaxation massage', category: 'Massage', duration: 60, price: 80, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's9', businessId: '4', name: 'Deep Tissue', description: 'Therapeutic deep massage', category: 'Massage', duration: 60, price: 100, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [],
    reviews: [],
  },
  {
    id: '5',
    ownerId: 'owner5',
    name: 'Bold & Beautiful Makeup',
    slug: 'bold-beautiful-makeup',
    description: 'Professional makeup artistry for all occasions.',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop',
    phone: '+254 755 789 012',
    email: 'beauty@boldandbeautiful.com',
    address: '555 Glamour Ave',
    city: 'Nakuru',
    country: 'Kenya',
    latitude: -0.3031,
    longitude: 36.0800,
    serviceRadius: 20,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'FEATURED',
    rating: 4.8,
    reviewCount: 234,
    totalEarnings: 87000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's10', businessId: '5', name: 'Bridal Makeup', description: 'Complete bridal look', category: 'Makeup', duration: 90, price: 200, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 's11', businessId: '5', name: 'Party Glam', description: 'Glamorous party makeup', category: 'Makeup', duration: 60, price: 100, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [],
    reviews: [],
  },
  {
    id: '6',
    ownerId: 'owner6',
    name: 'Urban Edge Hair Studio',
    slug: 'urban-edge',
    description: 'Trendy hair studio for the modern individual.',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop',
    phone: '+254 766 890 123',
    email: 'style@urbanedge.com',
    address: '999 Trend Street',
    city: 'Eldoret',
    country: 'Kenya',
    latitude: 0.5143,
    longitude: 35.2698,
    serviceRadius: 10,
    verificationStatus: 'APPROVED',
    subscriptionPlan: 'FREE',
    rating: 4.6,
    reviewCount: 145,
    totalEarnings: 52000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [
      { id: 's12', businessId: '6', name: 'Creative Cut', description: 'Fashion-forward haircut', category: 'Haircuts & Styling', duration: 45, price: 65, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ],
    staff: [],
    reviews: [],
  },
];

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auth prompt modal state for guests
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<'book' | 'favorite' | 'message' | 'review' | 'block' | 'report' | 'support' | 'dashboard'>('book');

  // Use auth store for user state
  const { user, logout, switchMode, activateProviderMode, isAuthenticated } = useAuthStore();
  const { getApplicationByUserId, addApplication } = useAdminStore();

  // Guest mode - if not authenticated, treat as CLIENT guest
  const isGuest = !isAuthenticated && !user;

  // Get active mode for dual role support
  const activeMode = user?.activeMode || 'CLIENT';
  const hasProviderRole = user?.roles?.includes('BUSINESS_OWNER') || user?.role === 'BUSINESS_OWNER';
  const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';

  // Mode-based access control
  const isProviderMode = activeMode === 'PROVIDER' && hasProviderRole;
  const canPerformClientActions = !isAdmin && !isProviderMode;

  // Handler for protected actions - prompts login if guest
  const requireAuth = useCallback((action: 'book' | 'favorite' | 'message' | 'review' | 'block' | 'report' | 'support' | 'dashboard', callback?: () => void) => {
    if (isGuest) {
      setAuthPromptAction(action);
      setShowAuthPrompt(true);
      return false;
    }
    callback?.();
    return true;
  }, [isGuest]);

  // Simulate loading on page change
  const handleNavigate = useCallback((page: string, tab?: string) => {
    // Scroll to top when navigating to a new page
    window.scrollTo(0, 0);
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      if (tab) setDashboardTab(tab);
      setIsLoading(false);
    }, 150);
  }, []);

  // Handle business selection
  const handleSelectBusiness = useCallback((business: Business) => {
    setSelectedBusiness(business);
    handleNavigate('business');
  }, [handleNavigate]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle category selection
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Handle login - navigate based on user ACTIVE MODE (DUAL USER ROLES)
  const handleLogin = useCallback((loggedInUser?: typeof user) => {
    const currentUser = loggedInUser || user;
    
    if (!currentUser) return;
    
    // Check if user has ADMIN role
    const isAdminUser = currentUser.roles?.includes('ADMIN') || currentUser.role === 'ADMIN';
    if (isAdminUser) {
      handleNavigate('admin-dashboard');
      return;
    }
    
    // Check if user has BUSINESS_OWNER role and verification status
    const hasBusinessRole = currentUser.roles?.includes('BUSINESS_OWNER') || currentUser.role === 'BUSINESS_OWNER';
    
    // Get active mode (defaults to CLIENT if not set)
    const mode = currentUser.activeMode || 'CLIENT';
    
    if (hasBusinessRole && mode === 'PROVIDER') {
      // Provider mode - check verification
      const application = getApplicationByUserId(currentUser.id);
      
      if (!application || application.status === 'PENDING') {
        handleNavigate('onboarding');
        return;
      }
      
      if (application.status === 'APPROVED') {
        handleNavigate('business-dashboard');
        return;
      }
      
      if (application.status === 'REJECTED') {
        handleNavigate('onboarding');
        return;
      }
    }
    
    // Default to CLIENT mode / Customer home
    handleNavigate('home');
  }, [handleNavigate, user, getApplicationByUserId]);

  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    handleNavigate('onboarding');
  }, [handleNavigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    handleNavigate('home');
  }, [handleNavigate, logout]);

  // Handle payment complete
  const handlePaymentComplete = useCallback(() => {
    handleNavigate('customer-dashboard');
  }, [handleNavigate]);

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <HeroSection
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              businesses={sampleBusinesses}
              onSelectBusiness={handleSelectBusiness}
            />
            <FeaturedBusinesses
              businesses={sampleBusinesses}
              onSelectBusiness={handleSelectBusiness}
              onNavigate={handleNavigate}
              onFavorite={() => requireAuth('favorite')}
              isGuest={isGuest}
            />
            <CategoriesSection onSelectCategory={handleSelectCategory} />
            <CTASection onNavigate={handleNavigate} />
          </motion.div>
        );

      case 'map':
        return (
          <MapPage
            key="map"
            businesses={sampleBusinesses}
            onSelectBusiness={handleSelectBusiness}
          />
        );

      case 'marketplace':
        return (
          <MarketplacePage
            key="marketplace"
            businesses={sampleBusinesses}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            useMyLocation={useMyLocation}
            onSelectBusiness={handleSelectBusiness}
            onSearch={handleSearch}
            onFavorite={() => requireAuth('favorite')}
            isGuest={isGuest}
          />
        );

      case 'business':
        return selectedBusiness ? (
          <BusinessProfilePage
            key="business"
            business={selectedBusiness}
            onBack={() => handleNavigate('home')}
            onBook={(service) => {
              // Require auth for booking
              requireAuth('book', () => {
                setSelectedService(service ?? null);
                handleNavigate('booking');
              });
            }}
            onFavorite={() => {
              // Require auth for favoriting
              requireAuth('favorite');
            }}
            onMessage={() => {
              // Require auth for messaging
              requireAuth('message');
            }}
            isGuest={isGuest}
          />
        ) : null;

      case 'booking':
        // Guest cannot access booking - redirect to auth
        if (isGuest) {
          return (
            <motion.div
              key="booking-auth-required"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Sign in to Book</h2>
                <p className="text-muted-foreground mb-6">
                  Create an account or sign in to complete your booking.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        // Check if user can perform client actions (booking)
        if (!canPerformClientActions) {
          return (
            <motion.div
              key="booking-blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Booking Not Available</h2>
                <p className="text-muted-foreground mb-6">
                  {isAdmin 
                    ? "Admin accounts cannot book services."
                    : "As a service provider, you can't book services in Provider Mode. Switch to Client Mode to book."
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {isProviderMode && (
                    <button
                      onClick={() => {
                        switchMode('CLIENT');
                        handleNavigate('home');
                      }}
                      className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                    >
                      Switch to Client Mode
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigate('marketplace')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Browse Businesses
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        return selectedBusiness ? (
          <BookingPage
            key="booking"
            business={selectedBusiness}
            selectedService={selectedService}
            onBack={() => handleNavigate('business')}
            onComplete={() => handleNavigate('payment')}
          />
        ) : null;

      case 'payment':
        return selectedBusiness && selectedService ? (
          <PaymentCheckout
            key="payment"
            business={selectedBusiness}
            service={selectedService}
            date={new Date().toISOString().split('T')[0]}
            time="10:00"
            onComplete={handlePaymentComplete}
            onCancel={() => handleNavigate('booking')}
          />
        ) : null;

      case 'login':
      case 'register':
        return (
          <AuthPage
            key="auth"
            mode={currentPage}
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );

      // CUSTOMER DASHBOARD - accessible in CLIENT mode
      case 'customer-dashboard':
        // Require authentication for dashboard access
        if (isGuest) {
          return (
            <motion.div
              key="customer-dashboard-auth-required"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Sign in to Access Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  Create an account or sign in to view your dashboard and bookings.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        // Allow access if in CLIENT mode or if user only has CUSTOMER role
        if (activeMode === 'PROVIDER' && hasProviderRole) {
          handleNavigate('business-dashboard');
          return null;
        }
        return (
          <CustomerDashboard
            key="customer-dashboard"
            user={user}
            onNavigate={handleNavigate}
            initialTab={dashboardTab as any}
          />
        );

      // BUSINESS OWNER DASHBOARD (Service Provider) - accessible in PROVIDER mode
      case 'business-dashboard':
        // Check if user is authenticated
        if (!user) {
          // Not authenticated - redirect to login
          return (
            <motion.div
              key="business-dashboard-auth-required"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Sign in to Access Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be signed in as a business owner to access the Partner Dashboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        // Check if user has provider role
        if (!hasProviderRole) {
          // Authenticated but not a provider - show onboarding prompt
          return (
            <motion.div
              key="business-dashboard-no-role"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
                <p className="text-muted-foreground mb-6">
                  You need to register as a business owner to access the Partner Dashboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleNavigate('onboarding')}
                    className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                  >
                    Start Onboarding
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        // Check verification status
        const application = user ? getApplicationByUserId(user.id) : null;
        if (!application || application.status !== 'APPROVED') {
          // Has role but not verified - redirect to onboarding
          return (
            <motion.div
              key="business-dashboard-pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Complete Your Setup</h2>
                <p className="text-muted-foreground mb-6">
                  {!application 
                    ? "You need to complete the onboarding process to access your dashboard."
                    : "Your application is pending approval. We'll notify you once it's approved."
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {!application && (
                    <button
                      onClick={() => handleNavigate('onboarding')}
                      className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                    >
                      Complete Onboarding
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigate('home')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        return (
          <BusinessDashboard
            key="business-dashboard"
            user={user}
            onNavigate={handleNavigate}
          />
        );

      // PROVIDER ONBOARDING - accessible by customers wanting to become providers
      case 'onboarding':
        // User must be logged in
        if (!user) {
          // Not authenticated - show prompt to register/login
          return (
            <motion.div
              key="onboarding-auth-required"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Sign in to Continue</h2>
                <p className="text-muted-foreground mb-6">
                  Create an account or sign in to register your business on GroomConnect.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleNavigate('register')}
                    className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => handleNavigate('login')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          );
        }
        // If already an approved provider, redirect to dashboard
        const existingApp = getApplicationByUserId(user.id);
        if (existingApp?.status === 'APPROVED') {
          return (
            <motion.div
              key="onboarding-already-approved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Already Registered</h2>
                <p className="text-muted-foreground mb-6">
                  Your business is already approved. Access your dashboard to manage your services.
                </p>
                <button
                  onClick={() => handleNavigate('business-dashboard')}
                  className="px-6 py-3 rounded-lg gradient-bg text-white font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          );
        }
        return (
          <ProviderOnboarding
            key="onboarding"
            onComplete={handleOnboardingComplete}
          />
        );

      // ADMIN DASHBOARD
      case 'admin-dashboard':
        if (!isAdmin) {
          handleNavigate('home');
          return null;
        }
        return (
          <AdminDashboard key="admin-dashboard" initialTab={dashboardTab as any} />
        );

      case 'chat':
        return (
          <ChatPage key="chat" user={user} onNavigate={handleNavigate} />
        );

      case 'calendar':
        return (
          <div key="calendar" className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <BookingCalendar
                services={sampleBusinesses[0].services || []}
                onSlotSelect={(date, time) => {
                  console.log('Selected:', date, time);
                }}
              />
            </div>
          </div>
        );

      case 'disputes':
        return (
          <div key="disputes" className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <DisputeCenter />
            </div>
          </div>
        );

      case 'about':
        return (
          <AboutPage
            key="about"
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'privacy':
        return (
          <PrivacyPage
            key="privacy"
            onBack={() => handleNavigate('home')}
          />
        );

      case 'terms':
        return (
          <TermsPage
            key="terms"
            onBack={() => handleNavigate('home')}
          />
        );

      case 'support':
        return (
          <SupportPage
            key="support"
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'safety':
        return (
          <SafetyPage
            key="safety"
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'blog':
        return (
          <BlogPage
            key="blog"
            onBack={() => handleNavigate('home')}
          />
        );

      case 'advertise':
        return (
          <AdvertisePage
            key="advertise"
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'insurance-claims':
        return (
          <InsuranceClaimsPage
            key="insurance-claims"
            onBack={() => handleNavigate('home')}
          />
        );

      // Additional pages referenced in footer
      case 'careers':
        return (
          <motion.div
            key="careers"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen py-20 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 gradient-text">Join Our Team</h1>
              <p className="text-muted-foreground mb-8">We're always looking for talented individuals to join GroomConnect.</p>
              <p className="text-lg">Careers page coming soon. Check back for openings!</p>
              <button
                onClick={() => handleNavigate('home')}
                className="mt-8 px-6 py-3 rounded-lg gradient-bg text-white font-medium"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        );

      case 'press':
        return (
          <motion.div
            key="press"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen py-20 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 gradient-text">Press & Media</h1>
              <p className="text-muted-foreground mb-8">Get the latest news and media resources from GroomConnect.</p>
              <p className="text-lg mb-4">For media inquiries, contact: <a href="mailto:press@groomconnect.co.ke" className="text-primary">press@groomconnect.co.ke</a></p>
              <button
                onClick={() => handleNavigate('home')}
                className="mt-8 px-6 py-3 rounded-lg gradient-bg text-white font-medium"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        );

      case 'api-docs':
        return (
          <motion.div
            key="api-docs"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen py-20 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-4 gradient-text">Developer API</h1>
              <p className="text-muted-foreground mb-8">Integrate GroomConnect into your applications.</p>
              <div className="glass-card p-6 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
                <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
                <p className="mb-4">Our REST API allows you to:</p>
                <ul className="list-disc list-inside space-y-2 mb-6">
                  <li>Search and list grooming businesses</li>
                  <li>Retrieve business details and services</li>
                  <li>Create and manage bookings</li>
                  <li>Handle payments and webhooks</li>
                </ul>
                <p className="text-muted-foreground">API access is currently in beta. Contact <a href="mailto:api@groomconnect.co.ke" className="text-primary">api@groomconnect.co.ke</a> to request access.</p>
              </div>
              <button
                onClick={() => handleNavigate('home')}
                className="mt-8 px-6 py-3 rounded-lg gradient-bg text-white font-medium"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        );

      case 'cookies':
        return (
          <motion.div
            key="cookies"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen py-20 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-4 gradient-text">Cookie Policy</h1>
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-muted-foreground mb-4">Last updated: January 2024</p>
                <h2 className="text-xl font-semibold mt-6 mb-2">What Are Cookies?</h2>
                <p className="mb-4">Cookies are small text files stored on your device when you visit our website.</p>
                <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Cookies</h2>
                <ul className="list-disc list-inside mb-4">
                  <li>Authentication and security</li>
                  <li>Remembering your preferences</li>
                  <li>Analytics and improvement</li>
                </ul>
                <h2 className="text-xl font-semibold mt-6 mb-2">Managing Cookies</h2>
                <p>You can manage cookies through your browser settings.</p>
              </div>
              <button
                onClick={() => handleNavigate('home')}
                className="mt-8 px-6 py-3 rounded-lg gradient-bg text-white font-medium"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isGuest={isGuest}
      />

      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      <Footer 
        onNavigate={handleNavigate} 
        onSetSearchQuery={setSearchQuery}
        onSetUseMyLocation={() => setUseMyLocation(true)}
      />

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action={authPromptAction}
        onSignIn={() => {
          setShowAuthPrompt(false);
          handleNavigate('login');
        }}
        onSignUp={() => {
          setShowAuthPrompt(false);
          handleNavigate('register');
        }}
      />
    </div>
  );
}
