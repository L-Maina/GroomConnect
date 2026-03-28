'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { 
  GlassCard, 
  GlassButton, 
  GlassInput,
  FadeIn,
} from '@/components/ui/custom/glass-components';
import { PhoneInput } from '@/components/ui/custom/PhoneInput';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import type { User as UserType } from '@/types';

interface AuthPageProps {
  mode: 'login' | 'register';
  onLogin?: (user: UserType) => void;
  onNavigate?: (page: string) => void;
}

// Apple Icon Component
const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onLogin,
  onNavigate,
}) => {
  const { login: storeLogin } = useAuthStore();
  const [currentMode, setCurrentMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Role is no longer selected during registration - users switch modes after login
  
  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derive canResend from otpTimer instead of separate state
  const canResend = otpTimer === 0 && step === 2;

  // Timer for OTP resend
  useEffect(() => {
    if (step !== 2 || otpTimer <= 0) return;
    
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, otpTimer]);

  // Clear errors when switching modes
  useEffect(() => {
    setError('');
    setOtpError('');
  }, [currentMode, step]);

  // Validate email
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // Validate phone (basic validation)
  const isValidPhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  // Validate password
  const isValidPassword = (pwd: string) => {
    return pwd.length >= 6;
  };

  // Handle sign in - preserve role from existing account or check for business owner email
  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Check for admin email (admin@groomconnect.com or contains 'admin')
      const isAdmin = email.toLowerCase() === 'admin@groomconnect.com' || 
                      email.toLowerCase() === 'admin' ||
                      email.toLowerCase().includes('admin@');
      
      // Check if this is a business owner email
      const isBusinessOwner = email.toLowerCase().includes('business') || 
                              email.toLowerCase().includes('owner') ||
                              email.toLowerCase().includes('elite') ||
                              localStorage.getItem('groomconnect-user-role') === 'BUSINESS_OWNER';
      
      // Determine role
      let userRole: 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN' = 'CUSTOMER';
      if (isAdmin) {
        userRole = 'ADMIN';
      } else if (isBusinessOwner) {
        userRole = 'BUSINESS_OWNER';
      }
      
      // Get stored verification status for business owners
      const storedVerificationStatus = localStorage.getItem('groomconnect-verification-status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null;
      const storedBusinessName = localStorage.getItem('groomconnect-business-name');
      
      const user: UserType = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: userRole,
        roles: [userRole], // Initialize roles array
        activeMode: userRole === 'ADMIN' ? 'ADMIN' : userRole === 'BUSINESS_OWNER' ? 'PROVIDER' : 'CLIENT', // Set active mode
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // For business owners, include verification status
        ...(userRole === 'BUSINESS_OWNER' && {
          businessVerificationStatus: storedVerificationStatus || 'PENDING',
          businessName: storedBusinessName || undefined,
        }),
      };
      
      // Store role for future logins
      localStorage.setItem('groomconnect-user-role', userRole);
      
      // Update auth store
      storeLogin(user, `token-${Date.now()}`);
      
      // Call the onLogin callback
      onLogin?.(user);
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign in
  const handleSocialSignIn = async (provider: 'google' | 'apple' | 'phone') => {
    setError('');
    setIsLoading(true);

    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Check stored role
      const storedRole = localStorage.getItem('groomconnect-user-role');
      const storedVerificationStatus = localStorage.getItem('groomconnect-verification-status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null;
      const storedBusinessName = localStorage.getItem('groomconnect-business-name');
      
      let userRole: 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN' = (storedRole as 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN') || 'CUSTOMER';
      
      const user: UserType = {
        id: `user-${Date.now()}`,
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        role: userRole,
        roles: [userRole], // Initialize roles array
        activeMode: userRole === 'ADMIN' ? 'ADMIN' : userRole === 'BUSINESS_OWNER' ? 'PROVIDER' : 'CLIENT', // Set active mode
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // For business owners, include verification status
        ...(userRole === 'BUSINESS_OWNER' && {
          businessVerificationStatus: storedVerificationStatus || 'PENDING',
          businessName: storedBusinessName || undefined,
        }),
      };
      
      // Update auth store
      storeLogin(user, `token-${Date.now()}`);
      
      // Call the onLogin callback
      onLogin?.(user);
    } catch {
      setError(`${provider} sign in failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue to OTP
  const handleContinueToOtp = async () => {
    setError('');
    
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsOtpSent(true);
      setOtpTimer(60);
      setStep(2);
      
      // Focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setOtpTimer(60);
    setIsLoading(true);
    
    try {
      // Simulate resending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      inputRefs.current[0]?.focus();
    } catch {
      setOtpError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP change
  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  // Handle OTP key down
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handleOTPKeyDownGlobal = (e: React.KeyboardEvent) => {
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        
        const lastIndex = Math.min(digits.length, 5);
        inputRefs.current[lastIndex]?.focus();
        
        if (newOtp.every(d => d !== '')) {
          handleVerifyOtp(newOtp.join(''));
        }
      });
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (otpCode: string) => {
    setOtpError('');
    setIsLoading(true);
    
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Demo: accept any 6-digit OTP
      if (otpCode.length === 6) {
        // All new users start as CUSTOMER - they can switch to PROVIDER mode later via onboarding
        const user: UserType = {
          id: `user-${Date.now()}`,
          email,
          name,
          phone,
          role: 'CUSTOMER',
          roles: ['CUSTOMER'], // Initialize roles array
          activeMode: 'CLIENT', // Default to CLIENT mode
          phoneVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Store role for future logins
        localStorage.setItem('groomconnect-user-role', 'CUSTOMER');
        
        // Update auth store
        storeLogin(user, `token-${Date.now()}`);
        
        // Call the onLogin callback
        onLogin?.(user);
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone for display
  const formatPhoneForDisplay = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 hero-pattern"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <FadeIn>
          <button
            onClick={() => step === 2 ? setStep(1) : onNavigate?.('home')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 2 ? 'Back to registration' : 'Back to Home'}
          </button>
        </FadeIn>

        <FadeIn delay={0.1}>
          <GlassCard variant="elevated" className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="text-2xl font-bold mb-2 brand-logo">
                <span className="groom">Groom</span>
                <span className="connect">Connect</span>
              </div>
              <p className="text-muted-foreground">
                {currentMode === 'login' 
                  ? 'Welcome back! Please sign in to continue.'
                  : step === 2 
                    ? 'Verify your phone number'
                    : 'Create your account to get started.'}
              </p>
            </div>

            {/* Mode Toggle - Only show on step 1 */}
            {step === 1 && (
              <div className="flex gap-2 p-1 rounded-lg bg-muted/50 mb-6">
                <button
                  onClick={() => setCurrentMode('login')}
                  className={cn(
                    'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
                    currentMode === 'login'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentMode('register')}
                  className={cn(
                    'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
                    currentMode === 'register'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            {currentMode === 'login' && step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <GlassInput
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <GlassInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input accent-primary" />
                    Remember me
                  </label>
                  <button type="button" className="text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleLogin}
                  isLoading={isLoading}
                >
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </GlassButton>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <GlassButton 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleSocialSignIn('google')}
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                  </GlassButton>
                  <GlassButton 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleSocialSignIn('apple')}
                    disabled={isLoading}
                  >
                    <AppleIcon />
                  </GlassButton>
                  <GlassButton 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleSocialSignIn('phone')}
                    disabled={isLoading}
                  >
                    <Phone className="h-5 w-5" />
                  </GlassButton>
                </div>
              </motion.div>
            )}

            {/* Register Form - Step 1 */}
            {currentMode === 'register' && step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <GlassInput
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <GlassInput
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <PhoneInput
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    placeholder="+254 7XX XXX XXX"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-formatted with country code • We&apos;ll send you a verification code
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <GlassInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleContinueToOtp}
                  isLoading={isLoading}
                  disabled={!name || !email || !phone || !password}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </GlassButton>

                <p className="text-center text-sm text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <button type="button" className="text-primary hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </p>
              </motion.div>
            )}

            {/* OTP Verification - Step 2 */}
            {currentMode === 'register' && step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
                onKeyDown={handleOTPKeyDownGlobal}
              >
                <div className="text-center mb-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow"
                  >
                    <Phone className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="font-semibold mb-2 text-lg">Verify Phone Number</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-sm font-medium">{formatPhoneForDisplay(phone)}</p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'w-12 h-14 text-center text-xl font-bold rounded-xl',
                        'border-2 transition-all duration-200',
                        'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50',
                        digit 
                          ? 'border-primary bg-primary/5' 
                          : 'border-input hover:border-primary/30',
                        otpError && 'border-destructive'
                      )}
                    />
                  ))}
                </div>

                {/* Error message */}
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-destructive"
                  >
                    {otpError}
                  </motion.p>
                )}

                {/* Timer and Resend */}
                <div className="text-center">
                  {canResend ? (
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resend Code
                    </GlassButton>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend code in <span className="font-medium text-foreground">{otpTimer}s</span>
                    </p>
                  )}
                </div>

                {/* Hint */}
                <p className="text-center text-xs text-muted-foreground">
                  Demo: Enter any 6 digits to continue
                </p>

                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => handleVerifyOtp(otp.join(''))}
                  isLoading={isLoading}
                  disabled={otp.some(d => d === '')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify & Create Account
                </GlassButton>

                <GlassButton
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </GlassButton>
              </motion.div>
            )}
          </GlassCard>
        </FadeIn>
      </div>
    </motion.div>
  );
};

export default AuthPage;
