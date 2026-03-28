'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// GLASS CARD COMPONENT
// ============================================

interface GlassCardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = true, glow = false, children, onClick }, ref) => {
    const variants = {
      default: 'glass-card',
      elevated: 'glass-card shadow-lg',
      bordered: 'glass-card border-2 border-primary/20',
      gradient: 'glass-card gradient-border',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          hover && 'hover:shadow-xl',
          glow && 'shadow-glow',
          'p-6 text-foreground',
          className
        )}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// ============================================
// GLASS BUTTON COMPONENT
// ============================================

interface GlassButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const GlassButton: React.FC<GlassButtonProps & React.RefAttributes<HTMLButtonElement>> = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    onClick,
    type = 'button',
    title,
  }, ref) => {
    const variants = {
      default: cn(
        'bg-white/10 backdrop-blur-sm border border-white/20',
        'hover:bg-white/25 hover:backdrop-blur-md hover:border-white/40 hover:shadow-lg hover:shadow-primary/10',
        'active:bg-white/15 active:scale-95',
        'text-foreground'
      ),
      primary: cn(
        'gradient-bg text-white shadow-glow-sm',
        'hover:brightness-110 hover:shadow-glow hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5',
        'active:brightness-90 active:scale-[0.98]',
        'transition-all duration-200'
      ),
      secondary: cn(
        'bg-secondary/20 border border-transparent',
        'hover:bg-secondary/40 hover:border-secondary/50 hover:shadow-md hover:shadow-secondary/20',
        'active:bg-secondary/25 active:scale-95',
        'text-foreground'
      ),
      outline: cn(
        'border-2 border-primary/30 bg-transparent',
        'hover:bg-primary/10 hover:border-primary/60 hover:shadow-md hover:shadow-primary/10',
        'active:bg-primary/20 active:scale-95'
      ),
      ghost: cn(
        'bg-transparent',
        'hover:bg-primary/15 hover:shadow-sm',
        'active:bg-primary/25 active:scale-95'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        title={title}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-colors duration-200 transition-transform duration-150 transition-shadow duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || isLoading}
        onClick={(e) => onClick?.(e)}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);
GlassButton.displayName = 'GlassButton';

// ============================================
// GLASS INPUT COMPONENT
// ============================================

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm',
            'px-3 py-2 text-sm text-foreground dark:text-foreground transition-all',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-destructive focus:ring-destructive/50',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);
GlassInput.displayName = 'GlassInput';

// ============================================
// GLASS MODAL COMPONENT
// ============================================

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'relative w-full glass-modal rounded-2xl p-6 shadow-2xl text-foreground',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        {(title || description) && (
          <div className="mb-4 pr-8">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        
        {/* Content */}
        {children}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// GLASS BADGE COMPONENT
// ============================================

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-muted/50 text-foreground dark:text-foreground',
    primary: 'bg-primary/20 text-primary dark:text-primary',
    secondary: 'bg-secondary/20 text-secondary dark:text-secondary',
    success: 'bg-green-500/20 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    destructive: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        'backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================
// GRADIENT TEXT COMPONENT
// ============================================

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const GradientText: React.FC<GradientTextProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <span className={cn('gradient-text', className)} {...props}>
      {children}
    </span>
  );
};

// ============================================
// SKELETON COMPONENT
// ============================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'skeleton',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

// ============================================
// FADE IN COMPONENT
// ============================================

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className,
  ...props
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// STAGGER CHILDREN COMPONENT
// ============================================

interface StaggerChildrenProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.1,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
