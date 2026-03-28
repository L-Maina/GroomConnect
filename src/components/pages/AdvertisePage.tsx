'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Target, 
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Building2,
  Globe,
  BarChart3,
  Zap,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  MousePointer,
  ShoppingCart,
  Crown,
  Rocket,
  X,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { 
  GlassCard, 
  GlassButton, 
  GlassInput,
  GradientText,
  FadeIn,
  GlassBadge,
  GlassModal
} from '@/components/ui/custom/glass-components';

interface AdvertisePageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const audienceStats = [
  { value: '500K+', label: 'Monthly Active Users', icon: Users },
  { value: '50K+', label: 'Daily Bookings', icon: ShoppingCart },
  { value: '25-45', label: 'Primary Age Group', icon: Target },
  { value: '85%', label: 'Mobile Users', icon: Globe },
];

const adOptions = [
  {
    id: 'featured',
    name: 'Featured Listing',
    description: 'Appear at the top of search results in your category. Perfect for businesses looking to increase visibility.',
    shortDescription: 'Top search placement for your business',
    price: '$199/month',
    priceValue: 199,
    icon: Star,
    color: '#6C4EFF',
    features: [
      'Top placement in search results',
      'Featured badge on profile',
      'Priority in map view',
      'Basic analytics dashboard',
      'Email support',
    ],
    highlighted_feature: '3x more profile views',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    description: 'Maximum visibility with banner ads, featured placement, and dedicated support. Best value for growing businesses.',
    shortDescription: 'Full-suite advertising solution',
    price: '$399/month',
    priceValue: 399,
    icon: Crown,
    color: '#3ABEFF',
    features: [
      'Everything in Featured Listing',
      'Banner ads on homepage',
      'Sponsored content opportunities',
      'Advanced analytics & reporting',
      'A/B testing for ads',
      'Dedicated account manager',
      'Priority support',
    ],
    highlighted_feature: '5x average ROI',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Solutions',
    description: 'Custom advertising solutions for large brands with multi-location support and dedicated campaign management.',
    shortDescription: 'Tailored for large organizations',
    price: 'Custom Pricing',
    priceValue: 0,
    icon: Rocket,
    color: '#10b981',
    features: [
      'Everything in Premium Package',
      'Custom campaign development',
      'Cross-platform promotion',
      'API integration',
      'Custom reporting',
      'Marketing consultation',
      'Multi-location support',
    ],
    highlighted_feature: 'Unlimited potential',
    popular: false,
  },
];

const advertisingFormats = [
  {
    icon: BarChart3,
    title: 'Search Ads',
    description: 'Appear when customers search for services you offer',
    stats: '15% avg. CTR',
    color: '#6C4EFF',
  },
  {
    icon: Eye,
    title: 'Profile Boost',
    description: 'Enhanced visibility for your business profile',
    stats: '3x more views',
    color: '#3ABEFF',
  },
  {
    icon: Zap,
    title: 'Sponsored Content',
    description: 'Featured articles and blog posts about your services',
    stats: '8% engagement',
    color: '#10b981',
  },
  {
    icon: Star,
    title: 'Promoted Reviews',
    description: 'Highlight your best reviews to attract customers',
    stats: '25% more bookings',
    color: '#f59e0b',
  },
];

const roiStats = [
  { label: 'Avg. Return on Investment', value: '3x', icon: DollarSign },
  { label: 'Average Click Rate', value: '15%', icon: MousePointer },
  { label: 'Conversion Rate', value: '8%', icon: ShoppingCart },
];

const successStories = [
  {
    business: 'Elite Cuts & Style',
    quote: 'Our bookings increased by 280% after switching to the Premium Package. Best investment we\'ve made!',
    owner: 'Marcus Williams',
    increase: '280%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    plan: 'Premium',
  },
  {
    business: 'Serenity Spa',
    quote: 'The ROI is incredible. We reached customers we never could have found on our own.',
    owner: 'Jennifer Chen',
    increase: '195%',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face',
    plan: 'Featured',
  },
];

export const AdvertisePage: React.FC<AdvertisePageProps> = ({ onBack, onNavigate }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Check if user is a provider
  const hasProviderRole = user?.roles?.includes('BUSINESS_OWNER') || user?.role === 'BUSINESS_OWNER';
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [contactForm, setContactForm] = useState({
    company: '',
    email: '',
    phone: '',
    budget: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGetStarted = (planId: string) => {
    if (!isAuthenticated) {
      // Non-logged-in user - prompt login
      setSelectedPlan(planId);
      setShowSignInPrompt(true);
      return;
    }
    
    if (!hasProviderRole) {
      // Logged-in but not a provider - prompt onboarding
      setSelectedPlan(planId);
      setShowOnboardingPrompt(true);
      return;
    }
    
    // Logged-in provider - show plan modal
    setSelectedPlan(planId);
    setShowPlanModal(true);
  };

  const handleContinueToForm = () => {
    setShowPlanModal(false);
    setTimeout(() => {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ADVERTISE',
          name: contactForm.company,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: `Advertising Inquiry: ${selectedPlan || 'General'}`,
          message: `Budget: ${contactForm.budget}\n\n${contactForm.message}`,
          metadata: JSON.stringify({ plan: selectedPlan, budget: contactForm.budget }),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setContactForm({ company: '', email: '', phone: '', budget: '', message: '' });
        setSelectedPlan(null);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = adOptions.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero */}
        <FadeIn className="text-center mb-12">
          <motion.div 
            className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-glow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Megaphone className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">
            Advertise with <GradientText>GroomConnect</GradientText>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Connect with millions of customers actively searching for grooming services. 
            Grow your business with targeted advertising.
          </p>
        </FadeIn>

        {/* Audience Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {audienceStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  variant="gradient" 
                  className="text-center relative overflow-hidden group gradient-bg"
                  glow
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-white relative z-10" />
                  <div className="text-2xl font-bold text-white relative z-10">{stat.value}</div>
                  <div className="text-sm text-white/90 relative z-10">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Advertising Formats */}
        <FadeIn delay={0.2}>
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Advertising Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {advertisingFormats.map((format, index) => (
                <motion.div
                  key={format.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover className="text-center h-full group relative overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${format.color}20` }}
                    >
                      <format.icon className="h-6 w-6" style={{ color: format.color }} />
                    </div>
                    <h3 className="font-semibold mb-2">{format.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{format.description}</p>
                    <GlassBadge 
                      variant="success" 
                      className="text-xs"
                    >
                      {format.stats}
                    </GlassBadge>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Pricing Packages */}
        <FadeIn delay={0.3}>
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {adOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={option.popular ? 'md:-mt-4 md:mb-4' : ''}
              >
                <GlassCard 
                  variant={option.popular ? 'gradient' : 'elevated'} 
                  hover
                  glow={option.popular}
                  className={`h-full relative overflow-hidden ${
                    option.popular ? 'ring-2 ring-white/30 gradient-bg' : ''
                  } ${selectedPlan === option.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {/* Popular badge */}
                  {option.popular && (
                    <div className="absolute -top-0 right-0">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Liquid glass shimmer */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10">
                    {/* Icon and name */}
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.popular ? 'bg-white/20' : ''}`}
                        style={!option.popular ? { backgroundColor: `${option.color}15` } : undefined}
                      >
                        <option.icon 
                          className="h-6 w-6" 
                          style={{ color: option.popular ? 'white' : option.color }} 
                        />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${option.popular ? 'text-white' : ''}`}>
                          {option.name}
                        </h3>
                        <p className={`text-xs ${option.popular ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {option.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 ${option.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {option.description}
                    </p>

                    {/* Price */}
                    <div className={`mb-4 p-4 rounded-xl backdrop-blur-sm ${option.popular ? 'bg-white/10' : 'bg-muted/30'}`}>
                      <div className={`text-3xl font-bold ${option.popular ? 'text-white' : 'gradient-text'}`}>
                        {option.price}
                      </div>
                      <div className={`text-sm ${option.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {option.priceValue > 0 ? 'billed monthly' : 'contact for pricing'}
                      </div>
                    </div>

                    {/* Highlighted feature */}
                    <div className={`mb-4 p-3 rounded-lg border ${
                      option.popular 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-primary/5 border-primary/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${option.popular ? 'text-white' : 'text-primary'}`} />
                        <span className={`font-medium text-sm ${option.popular ? 'text-white' : ''}`}>
                          {option.highlighted_feature}
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {option.features.slice(0, 5).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${option.popular ? 'text-white' : 'text-green-600'}`} />
                          <span className={`text-sm ${option.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      {option.features.length > 5 && (
                        <li className={`text-sm ${option.popular ? 'text-white/70' : 'text-muted-foreground'}`}>
                          +{option.features.length - 5} more features
                        </li>
                      )}
                    </ul>

                    {/* CTA Button */}
                    <GlassButton 
                      variant={option.popular ? 'primary' : 'outline'} 
                      className={`w-full ${option.popular ? 'bg-white text-primary hover:bg-white/90' : ''}`}
                      onClick={() => handleGetStarted(option.id)}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Get Started
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* ROI Section */}
        <FadeIn delay={0.4}>
          <GlassCard variant="bordered" className="mb-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold mb-4">Why Advertise with Us?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Targeted Reach</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with customers actively searching for your services in your area
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">High ROI</h3>
                      <p className="text-sm text-muted-foreground">
                        Average advertisers see 3x return on their investment within 90 days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-time Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your campaign performance with detailed insights and reporting
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  {roiStats.map((stat, index) => (
                    <motion.div 
                      key={stat.label} 
                      className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-xl p-4 text-center border border-primary/10 shadow-lg hover:shadow-xl transition-shadow"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Success Stories */}
        <FadeIn delay={0.45}>
          <h2 className="text-2xl font-bold mb-6 text-center">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {successStories.map((story, index) => (
              <motion.div
                key={story.business}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="relative overflow-hidden group">
                  {/* Liquid glass hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <GlassBadge variant="success" className="text-sm">+{story.increase} bookings</GlassBadge>
                    </div>
                    <div className="flex items-start gap-4 mb-4 pr-24">
                      <img
                        src={story.avatar}
                        alt={story.owner}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div>
                        <h3 className="font-semibold">{story.business}</h3>
                        <p className="text-sm text-muted-foreground">{story.owner}</p>
                        <GlassBadge variant="primary" className="mt-1 text-xs">{story.plan} Plan</GlassBadge>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic relative">&ldquo;{story.quote}&rdquo;</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Contact Form */}
        <FadeIn delay={0.5} id="contact-form">
          <GlassCard variant="elevated" className="relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-foreground">Get in Touch</h2>
                <p className="text-foreground/80">
                  Ready to grow your business? Contact our advertising team today.
                </p>
                {selectedPlan && selectedPlanData && (
                  <div className="mt-4 inline-flex items-center gap-2 p-2 px-4 rounded-full bg-primary/10 border border-primary/20">
                    <selectedPlanData.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Selected: {selectedPlanData.name}</span>
                    <button 
                      onClick={() => setSelectedPlan(null)}
                      className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Status Messages */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">Inquiry submitted successfully!</p>
                      <p className="text-sm text-green-600 dark:text-green-500">Our advertising team will contact you within 24 hours.</p>
                    </div>
                  </motion.div>
                )}
                
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">Failed to submit inquiry</p>
                      <p className="text-sm text-red-600 dark:text-red-500">Please try again or contact us directly.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <GlassInput
                      placeholder="Your company"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <GlassInput
                      type="email"
                      placeholder="your@company.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <GlassInput
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Budget</label>
                    <select
                      value={contactForm.budget}
                      onChange={(e) => setContactForm({ ...contactForm, budget: e.target.value })}
                      className="w-full h-10 p-3 rounded-lg border border-input bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select budget range</option>
                      <option value="$100 - $250">$100 - $250/month</option>
                      <option value="$250 - $500">$250 - $500/month</option>
                      <option value="$500 - $1000">$500 - $1,000/month</option>
                      <option value="$1000+">$1,000+/month</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tell us about your advertising goals</label>
                  <textarea
                    placeholder="What are you looking to achieve with your advertising campaign?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
                  />
                </div>
                <div className="flex justify-center pt-2">
                  <GlassButton 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    rightIcon={<Send className="h-4 w-4" />}
                    disabled={isSubmitting}
                    className="min-w-48"
                  >
                    {isSubmitting ? 'Submitting...' : 'Contact Our Team'}
                  </GlassButton>
                </div>
              </form>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Contact Info */}
        <FadeIn delay={0.6}>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-3">
              Prefer to talk? Reach our advertising team directly:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="mailto:ads@groomconnect.com" 
                className="flex items-center gap-2 text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                <Globe className="h-4 w-4" />
                ads@groomconnect.com
              </a>
              <a 
                href="tel:+18005559876" 
                className="flex items-center gap-2 text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                1-800-555-9876
              </a>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Plan Selection Modal */}
      <GlassModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={selectedPlanData?.name || 'Select Plan'}
        description={selectedPlanData?.description}
        size="lg"
      >
        {selectedPlanData && (
          <div className="space-y-6">
            {/* Plan summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedPlanData.color}20` }}
              >
                <selectedPlanData.icon className="h-8 w-8" style={{ color: selectedPlanData.color }} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPlanData.name}</h3>
                <p className="text-2xl font-bold gradient-text">{selectedPlanData.price}</p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium mb-3">What&apos;s included:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlanData.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex gap-3 justify-end">
              <GlassButton variant="ghost" onClick={() => setShowPlanModal(false)}>
                Cancel
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={handleContinueToForm}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Continue to Form
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Sign In Prompt Modal */}
      <GlassModal
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        title="Sign In Required"
        description="You need to be signed in to subscribe to an advertising plan."
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Create an account or sign in to start advertising your business on GroomConnect.
            </p>
          </div>
          
          {selectedPlanData && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">Selected Plan:</p>
              <p className="font-semibold">{selectedPlanData.name} - {selectedPlanData.price}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <GlassButton 
              variant="primary" 
              className="w-full"
              onClick={() => {
                setShowSignInPrompt(false);
                onNavigate?.('auth');
              }}
              leftIcon={<LogIn className="h-4 w-4" />}
            >
              Sign In / Sign Up
            </GlassButton>
            <GlassButton 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowSignInPrompt(false)}
            >
              Maybe Later
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Onboarding Prompt Modal for non-providers */}
      <GlassModal
        isOpen={showOnboardingPrompt}
        onClose={() => setShowOnboardingPrompt(false)}
        title="Become a Partner"
        description="You need to register as a service provider to advertise on GroomConnect."
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Register your business on GroomConnect to start advertising and reaching more customers.
            </p>
          </div>
          
          {selectedPlanData && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">Selected Plan:</p>
              <p className="font-semibold">{selectedPlanData.name} - {selectedPlanData.price}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <GlassButton 
              variant="primary" 
              className="w-full"
              onClick={() => {
                setShowOnboardingPrompt(false);
                onNavigate?.('onboarding');
              }}
              leftIcon={<Building2 className="h-4 w-4" />}
            >
              Start Onboarding
            </GlassButton>
            <GlassButton 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowOnboardingPrompt(false)}
            >
              Maybe Later
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

export default AdvertisePage;
