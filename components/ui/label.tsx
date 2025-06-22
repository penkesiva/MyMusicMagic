'use client';

import * as React from 'react';
import { FormLabel, FormLabelProps } from '@chakra-ui/react';
import { cn } from '@/lib/utils';

export type LabelProps = FormLabelProps;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <FormLabel
        ref={ref}
        className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label }; 