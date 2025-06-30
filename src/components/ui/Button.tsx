import React from 'react';
import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'green' | 'blue';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  size?: 'sm' | 'default' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'default',
    isLoading = false,
    size = 'default',
    className = '',
    disabled = false,
    type = 'button',
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantStyles = {
      default: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus-visible:ring-yellow-500',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-100/10 text-gray-200 hover:text-white',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      ghost: 'hover:bg-gray-800/50 text-gray-200 hover:text-white',
      link: 'text-blue-500 hover:underline hover:bg-transparent p-0 h-auto',
      green: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
      blue: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    };

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs',
      default: 'h-10 py-2 px-4 text-sm',
      lg: 'h-11 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';