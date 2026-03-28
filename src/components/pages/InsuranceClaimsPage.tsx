'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  DollarSign,
  MessageSquare,
  ChevronRight,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Eye,
  Send,
  X,
  Info,
  FileCheck,
  Claim,
  AlertTriangle,
} from 'lucide-react';
import { 
  GlassCard, 
  GlassButton, 
  GlassInput,
  GradientText,
  FadeIn,
  GlassBadge,
  GlassModal
} from '@/components/ui/custom/glass-components';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';

interface InsuranceClaimsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

type UserType = 'customer' | 'provider';
type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';

interface ClaimData {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  businessName?: string;
  customerName?: string;
}

// Sample claims data
const sampleCustomerClaims: ClaimData[] = [
  {
    id: 'CLM-001',
    type: 'Service Dispute',
    description: 'Service did not match description - hair coloring resulted in significant color mismatch',
    amount: 150,
    status: 'under_review',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
    businessName: 'Glamour Studio',
  },
  {
    id: 'CLM-002',
    type: 'Refund Request',
    description: 'Appointment cancelled by provider with less than 24 hours notice',
    amount: 80,
    status: 'approved',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    businessName: 'Elite Cuts & Style',
  },
];

const sampleProviderClaims: ClaimData[] = [
  {
    id: 'CLM-003',
    type: 'No-Show',
    description: 'Customer did not show up for scheduled appointment',
    amount: 45,
    status: 'pending',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
    customerName: 'John D.',
  },
  {
    id: 'CLM-004',
    type: 'Damage Claim',
    description: 'Customer caused damage to salon equipment during appointment',
    amount: 200,
    status: 'under_review',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14',
    customerName: 'Sarah M.',
  },
];

const claimTypes = {
  customer: [
    { value: 'service_dispute', label: 'Service Dispute' },
    { value: 'refund_request', label: 'Refund Request' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'billing_error', label: 'Billing Error' },
    { value: 'other', label: 'Other' },
  ],
  provider: [
    { value: 'no_show', label: 'Customer No-Show' },
    { value: 'damage', label: 'Property Damage' },
    { value: 'payment_dispute', label: 'Payment Dispute' },
    { value: 'harassment', label: 'Harassment Report' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'other', label: 'Other' },
  ],
};

const statusColors: Record<ClaimStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const statusLabels: Record<ClaimStatus, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
};

export const InsuranceClaimsPage: React.FC<InsuranceClaimsPageProps> = ({ onBack, onNavigate }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [userType, setUserType] = useState<UserType>('customer');
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newClaim, setNewClaim] = useState({
    type: '',
    description: '',
    amount: '',
    bookingId: '',
    attachments: [] as File[],
  });

  const claims = userType === 'customer' ? sampleCustomerClaims : sampleProviderClaims;

  const handleNewClaimClick = () => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
      return;
    }
    setShowNewClaimModal(true);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CLAIM',
          name: user.name || user.email,
          email: user.email,
          subject: `Insurance Claim: ${newClaim.type}`,
          message: newClaim.description,
          category: userType === 'customer' ? 'CUSTOMER_CLAIM' : 'PROVIDER_CLAIM',
          userId: user.id,
          metadata: JSON.stringify({
            claimType: newClaim.type,
            amount: parseFloat(newClaim.amount),
            bookingId: newClaim.bookingId,
            userType,
            attachmentCount: newClaim.attachments.length,
          }),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setShowNewClaimModal(false);
          setNewClaim({ type: '', description: '', amount: '', bookingId: '', attachments: [] });
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewClaim(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setNewClaim(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header */}
        <FadeIn className="mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <GradientText>Insurance Claims</GradientText>
            </h1>
            <p className="text-muted-foreground">Submit and track your claims</p>
          </div>
        </FadeIn>
        
        {/* User Type Toggle */}
        <FadeIn className="mb-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border">
              <button
                onClick={() => setUserType('customer')}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all',
                  userType === 'customer'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <User className="h-4 w-4" />
                Customer Claims
              </button>
              <button
                onClick={() => setUserType('provider')}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all',
                  userType === 'provider'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <Building2 className="h-4 w-4" />
                Provider Claims
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Info Card */}
        <FadeIn delay={0.1}>
          <GlassCard variant="bordered" className="mb-8 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {userType === 'customer' ? 'Customer Protection' : 'Provider Protection'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userType === 'customer' 
                    ? 'GroomConnect protects your bookings. If something goes wrong with your service, you can file a claim for a refund or compensation. Our team reviews all claims within 48 hours.'
                    : 'As a provider, you\'re protected against no-shows, property damage, and payment disputes. File a claim to report issues and receive compensation.'}
                </p>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="text-center p-4">
              <div className="text-2xl font-bold gradient-text">{claims.length}</div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </GlassCard>
            <GlassCard className="text-center p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {claims.filter(c => c.status === 'pending' || c.status === 'under_review').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </GlassCard>
            <GlassCard className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {claims.filter(c => c.status === 'approved' || c.status === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </GlassCard>
            <GlassCard className="text-center p-4">
              <div className="text-2xl font-bold text-foreground">
                ${claims.filter(c => c.status === 'approved' || c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Recovered</div>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Claims List */}
        <FadeIn delay={0.3}>
          <GlassCard variant="bordered" className="overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Your Claims</h2>
            </div>
            
            {claims.length === 0 ? (
              <div className="p-12 text-center">
                <FileCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Claims Filed</h3>
                <p className="text-muted-foreground mb-4">
                  {userType === 'customer' 
                    ? "You haven't filed any insurance claims yet."
                    : "No provider claims have been filed yet."}
                </p>
                <GlassButton
                  variant="primary"
                  onClick={handleNewClaimClick}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  File a Claim
                </GlassButton>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {claims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          claim.status === 'approved' || claim.status === 'paid' 
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : claim.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-yellow-100 dark:bg-yellow-900/30'
                        )}>
                          {claim.status === 'approved' || claim.status === 'paid' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : claim.status === 'rejected' ? (
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{claim.id}</span>
                            <GlassBadge className={cn('text-xs', statusColors[claim.status])}>
                              {statusLabels[claim.status]}
                            </GlassBadge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {claim.type} • {userType === 'customer' ? claim.businessName : claim.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">${claim.amount}</div>
                        <div className="text-xs text-muted-foreground">{claim.createdAt}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {claim.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Coverage Information */}
        <FadeIn delay={0.4} className="mt-8">
          <GlassCard variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Coverage Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">What's Covered</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    Service quality disputes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    Provider no-shows
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    Billing errors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    Safety concerns
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Claim Limits</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Up to $500 per incident
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Must file within 7 days
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Max 5 claims per month
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Processing Time</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Initial review: 48 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Full review: 5-7 days
                  </li>
                  <li className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Payout: 3-5 business days
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Contact Support */}
        <FadeIn delay={0.5} className="mt-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-3">Need help with your claim?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a 
                href="mailto:claims@groomconnect.co.ke" 
                className="flex items-center gap-2 text-primary hover:underline transition-colors"
              >
                <Mail className="h-4 w-4" />
                claims@groomconnect.co.ke
              </a>
              <a 
                href="tel:+254712345678" 
                className="flex items-center gap-2 text-primary hover:underline transition-colors"
              >
                <Phone className="h-4 w-4" />
                +254 712 345 678
              </a>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* New Claim Modal */}
      <GlassModal
        isOpen={showNewClaimModal}
        onClose={() => {
          setShowNewClaimModal(false);
          setSubmitStatus('idle');
        }}
        title="File a New Claim"
        description={
          userType === 'customer' 
            ? 'Submit a claim for a service issue or dispute'
            : 'Submit a claim for provider-related issues'
        }
        size="lg"
      >
        <form onSubmit={handleSubmitClaim} className="space-y-4">
          {/* Status Messages */}
          <AnimatePresence>
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Claim submitted successfully!</p>
                  <p className="text-sm text-green-600 dark:text-green-500">We'll review your claim within 48 hours.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Claim Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Claim Type *</label>
            <select
              value={newClaim.type}
              onChange={(e) => setNewClaim(prev => ({ ...prev, type: e.target.value }))}
              required
              className="w-full h-10 px-3 rounded-lg border border-input bg-background dark:bg-slate-800 text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select claim type</option>
              {claimTypes[userType].map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Booking ID */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Booking ID (if applicable)</label>
            <GlassInput
              placeholder="e.g., BK-12345"
              value={newClaim.bookingId}
              onChange={(e) => setNewClaim(prev => ({ ...prev, bookingId: e.target.value }))}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Claim Amount ($) *</label>
            <GlassInput
              type="number"
              placeholder="0.00"
              value={newClaim.amount}
              onChange={(e) => setNewClaim(prev => ({ ...prev, amount: e.target.value }))}
              required
              max="500"
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum claim amount: $500</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Description *</label>
            <textarea
              placeholder="Please describe your issue in detail..."
              value={newClaim.description}
              onChange={(e) => setNewClaim(prev => ({ ...prev, description: e.target.value }))}
              required
              minLength={50}
              className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background dark:bg-slate-800 text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 50 characters</p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Attachments (optional)</label>
            <div className="border-2 border-dashed border-input rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="claim-attachments"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="claim-attachments" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop files or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Images or PDFs, max 5MB each</p>
              </label>
            </div>
            {newClaim.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {newClaim.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setShowNewClaimModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={submitStatus === 'success' || isSubmitting}
              rightIcon={isSubmitting ? undefined : <Send className="h-4 w-4" />}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Claim Detail Modal */}
      <GlassModal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title={`Claim ${selectedClaim?.id}`}
        subtitle={selectedClaim?.type}
        size="lg"
      >
        {selectedClaim && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  statusColors[selectedClaim.status]
                )}>
                  {selectedClaim.status === 'approved' || selectedClaim.status === 'paid' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : selectedClaim.status === 'rejected' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{statusLabels[selectedClaim.status]}</p>
                  <p className="text-xs text-muted-foreground">Last updated: {selectedClaim.updatedAt}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${selectedClaim.amount}</p>
                <p className="text-xs text-muted-foreground">Claimed amount</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-foreground mt-1">{selectedClaim.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Created</label>
                  <p className="text-sm text-foreground mt-1">{selectedClaim.createdAt}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {userType === 'customer' ? 'Business' : 'Customer'}
                  </label>
                  <p className="text-sm text-foreground mt-1">
                    {userType === 'customer' ? selectedClaim.businessName : selectedClaim.customerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Claim Timeline</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Claim Submitted</p>
                    <p className="text-xs text-muted-foreground">{selectedClaim.createdAt}</p>
                  </div>
                </div>
                {selectedClaim.status !== 'pending' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Under Review</p>
                      <p className="text-xs text-muted-foreground">Claim is being reviewed by our team</p>
                    </div>
                  </div>
                )}
                {(selectedClaim.status === 'approved' || selectedClaim.status === 'paid') && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Approved</p>
                      <p className="text-xs text-muted-foreground">Your claim has been approved</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <GlassButton
                variant="ghost"
                onClick={() => setSelectedClaim(null)}
              >
                Close
              </GlassButton>
              <GlassButton
                variant="outline"
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Contact Support
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
        description="You need to be signed in to file an insurance claim."
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Create an account or sign in to file insurance claims and track their status.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <GlassButton 
              variant="primary" 
              className="w-full"
              onClick={() => {
                setShowSignInPrompt(false);
                onNavigate?.('auth');
              }}
              leftIcon={<User className="h-4 w-4" />}
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
    </div>
  );
};

export default InsuranceClaimsPage;
