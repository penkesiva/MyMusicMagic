'use client';

import * as React from 'react';
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export type TextareaProps = ChakraTextareaProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ChakraTextarea
        ref={ref}
        variant="filled"
        className={cn('w-full', className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea }; 