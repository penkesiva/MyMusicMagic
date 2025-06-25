'use client';

import * as React from 'react';
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export interface ThemedTextareaProps extends ChakraTextareaProps {
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, ThemedTextareaProps>(
  ({ className, bgColor, textColor, borderColor, ...props }, ref) => {
    return (
      <ChakraTextarea
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
Textarea.displayName = 'Textarea';

export { Textarea }; 