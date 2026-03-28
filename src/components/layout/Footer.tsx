'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  CreditCard,
  Shield,
  Clock,
} from 'lucide-react';
import { GradientText } from '@/components/ui/custom/glass-components';
import { cn } from '@/lib/utils';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onSetSearchQuery?: (query: string) => void;
  onSetUseMyLocation?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSetSearchQuery, onSetUseMyLocation }) => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    action();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle service link click - auto-detect location and navigate to marketplace
  const handleServiceClick = (e: React.MouseEvent, serviceName: string) => {
    e.preventDefault();
    // Set search query
    onSetSearchQuery?.(serviceName);
    // Trigger location detection (silently)
    onSetUseMyLocation?.();
    // Navigate to marketplace
    onNavigate?.('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    company: [
      { label: 'About Us', action: () => onNavigate?.('about') },
      { label: 'Careers', action: () => onNavigate?.('careers') },
      { label: 'Press', action: () => onNavigate?.('press') },
      { label: 'Blog', action: () => onNavigate?.('blog') },
    ],
    services: [
      { label: 'Haircuts & Styling', searchQuery: 'Haircuts & Styling' },
      { label: 'Beard Grooming', searchQuery: 'Beard Grooming' },
      { label: 'Nail Services', searchQuery: 'Nail Services' },
      { label: 'Spa & Wellness', searchQuery: 'Spa & Wellness' },
    ],
    support: [
      { label: 'Help Center', action: () => onNavigate?.('support') },
      { label: 'Safety', action: () => onNavigate?.('safety') },
      { label: 'Insurance Claims', action: () => onNavigate?.('insurance-claims') },
      { label: 'Terms of Service', action: () => onNavigate?.('terms') },
      { label: 'Privacy Policy', action: () => onNavigate?.('privacy') },
    ],
    partners: [
      { label: 'For Business', action: () => onNavigate?.('onboarding') },
      { label: 'Partner Dashboard', action: () => onNavigate?.('business-dashboard') },
      { label: 'Advertise', action: () => onNavigate?.('advertise') },
      { label: 'Developer API', action: () => onNavigate?.('api-docs') },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/groomconnect', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/groomconnect', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/groomconnect', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/groomconnect', label: 'LinkedIn' },
  ];

  const features = [
    { icon: CreditCard, label: 'Secure Payments' },
    { icon: Shield, label: 'Verified Businesses' },
    { icon: Clock, label: '24/7 Support' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/5" />
      
      <div className="relative z-10">
        {/* Features Bar - Liquid Glass */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 justify-center md:justify-start',
                    'p-3 rounded-xl',
                    'bg-white/5 backdrop-blur-sm',
                    'border border-white/10',
                    'transition-all duration-300 hover:bg-white/10'
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center backdrop-blur-sm">
                    <feature.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <span className="font-medium text-white">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <Link href="/" className="inline-block cursor-pointer">
                  <div className="flex items-center gap-1 text-2xl font-bold mb-4">
                    <span className="text-white">Groom</span>
                    <GradientText>Connect</GradientText>
                  </div>
                </Link>
                <p className="text-slate-400 mb-6 max-w-sm">
                  Your Style, On Demand. Discover grooming services across Kenya, book instantly, 
                  and look your best every day.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <span>Westlands Business Park, Nairobi, Kenya</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Phone className="h-4 w-4 text-secondary" />
                    </div>
                    <a href="tel:+254712345678" className="hover:text-white transition-colors cursor-pointer">+254 712 345 678</a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Mail className="h-4 w-4 text-secondary" />
                    </div>
                    <a href="mailto:hello@groomconnect.co.ke" className="hover:text-white transition-colors cursor-pointer">hello@groomconnect.co.ke</a>
                  </div>
                </div>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Company</h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <a
                        href="#"
                        onClick={(e) => handleNavClick(e, link.action)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all duration-200" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services Links */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Services</h4>
                <ul className="space-y-2">
                  {footerLinks.services.map((link) => (
                    <li key={link.label}>
                      <a
                        href="#"
                        onClick={(e) => handleServiceClick(e, link.searchQuery)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all duration-200" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Support</h4>
                <ul className="space-y-2">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <a
                        href="#"
                        onClick={(e) => handleNavClick(e, link.action)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all duration-200" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Partners Links */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Partners</h4>
                <ul className="space-y-2">
                  {footerLinks.partners.map((link) => (
                    <li key={link.label}>
                      <a
                        href="#"
                        onClick={(e) => handleNavClick(e, link.action)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all duration-200" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Bar - Liquid Glass */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">Payment Methods:</span>
                <div className="flex items-center gap-2">
                  {['VISA', 'Mastercard', 'PayPal', 'M-Pesa'].map((method) => (
                    <div 
                      key={method}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium',
                        'bg-white/10 backdrop-blur-sm',
                        'border border-white/10',
                        'text-white transition-all duration-200 hover:bg-white/15'
                      )}
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">Follow Us:</span>
                <div className="flex items-center gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center',
                        'bg-white/10 backdrop-blur-sm',
                        'border border-white/10',
                        'text-white transition-all duration-200',
                        'hover:bg-gradient-to-r hover:from-primary/30 hover:to-secondary/30',
                        'hover:border-white/20'
                      )}
                      aria-label={social.label}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                © {currentYear} GroomConnect. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <a 
                  href="#" 
                  onClick={(e) => handleNavClick(e, () => onNavigate?.('privacy'))} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  onClick={(e) => handleNavClick(e, () => onNavigate?.('terms'))} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </a>
                <a 
                  href="#" 
                  onClick={(e) => handleNavClick(e, () => onNavigate?.('cookies'))} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
