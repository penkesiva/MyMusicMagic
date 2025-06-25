'use client';

import * as React from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export interface ThemedInputProps extends ChakraInputProps {
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

const Input = React.forwardRef<HTMLInputElement, ThemedInputProps>(
  ({ className, bgColor, textColor, borderColor, ...props }, ref) => {
    return (
      <ChakraInput
        ref={ref}
        variant="filled"
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        _placeholder={{ color: textColor ? textColor + '99' : undefined }}
        _focus={{ borderColor: borderColor || 'purple.400', boxShadow: borderColor ? `0 0 0 2px ${borderColor}` : undefined }}
        className={cn('w-full', className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 