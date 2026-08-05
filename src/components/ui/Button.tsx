// Button Component
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      destructive: 'btn-destructive',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[40px]',
      md: 'px-5 py-3 text-base min-h-[48px]',
      lg: 'px-6 py-4 text-lg min-h-[56px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className={cn('flex-1 text-center', leftIcon && 'ml-1', rightIcon && 'mr-1')}>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg' }>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-9 h-9',
      md: 'w-11 h-11',
      lg: 'w-13 h-13',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn-ghost rounded-xl',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';