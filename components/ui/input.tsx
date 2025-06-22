'use client';

import * as React from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export type InputProps = ChakraInputProps;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <ChakraInput
        ref={ref}
        variant="filled"
        className={cn('w-full', className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 