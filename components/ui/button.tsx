'use client';

import * as React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const getChakraVariant = (): ChakraButtonProps['variant'] => {
      switch (variant) {
        case 'destructive':
          return 'solid';
        case 'outline':
          return 'outline';
        case 'secondary':
          return 'solid';
        case 'ghost':
          return 'ghost';
        case 'link':
          return 'link';
        case 'default':
        default:
          return 'solid';
      }
    };

    const getChakraColorScheme = (): ChakraButtonProps['colorScheme'] => {
      switch (variant) {
        case 'destructive':
          return 'red';
        case 'secondary':
          return 'gray';
        case 'default':
        default:
          return 'purple';
      }
    };

    const getChakraSize = (): ChakraButtonProps['size'] => {
      switch (size) {
        case 'sm':
          return 'sm';
        case 'lg':
          return 'lg';
        case 'default':
        default:
          return 'md';
      }
    };

    return (
      <ChakraButton
        ref={ref}
        variant={getChakraVariant()}
        colorScheme={getChakraColorScheme()}
        size={getChakraSize()}
        className={cn(
          {
            'w-10 h-10 min-w-0 p-0': size === 'icon', // Special handling for icon buttons
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button }; 