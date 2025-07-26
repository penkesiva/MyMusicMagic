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
    // Extract opacity from className if it contains opacity classes
    const opacityMatch = className?.match(/border-([^/]+)\/(\d+)/);
    const borderColorName = opacityMatch ? opacityMatch[1] : undefined;
    const opacity = opacityMatch ? opacityMatch[2] : undefined;
    
    // Remove opacity classes from className since we'll handle it in Chakra
    const cleanClassName = className?.replace(/border-[^/]+\/\d+/g, '') || '';
    
    // Convert Tailwind opacity to CSS opacity
    const cssOpacity = opacity ? parseInt(opacity) / 100 : 1;
    
    // Determine if this is a light or dark theme based on background color
    const isLightTheme = bgColor?.includes('white') || bgColor?.includes('bg-[#F') || bgColor?.includes('bg-[#E');
    
    // Set appropriate fallback border color based on theme type
    const fallbackBorderColor = isLightTheme 
      ? 'rgba(0, 0, 0, 0.4)' // Darker border for light themes
      : 'rgba(255, 255, 255, 0.1)'; // Light border for dark themes
    
    // Convert Tailwind color names to CSS colors with opacity
    const getBorderColorWithOpacity = () => {
      if (!borderColorName || !opacity) return borderColor || fallbackBorderColor;
      
      // Map Tailwind colors to CSS colors
      const colorMap: { [key: string]: string } = {
        'gray-500': '#6b7280',
        'white': '#ffffff',
        'purple-400': '#a78bfa',
        'red-400': '#f87171',
        'blue-400': '#60a5fa',
        'yellow-400': '#facc15',
        'green-400': '#4ade80'
      };
      
      const baseColor = colorMap[borderColorName] || '#6b7280'; // default to gray-500
      return `${baseColor}${Math.round(cssOpacity * 255).toString(16).padStart(2, '0')}`;
    };
    
    return (
      <ChakraInput
        ref={ref}
        variant="unstyled"
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        border="1px solid"
        _placeholder={{ color: textColor ? textColor + '99' : undefined }}
        _focus={{ borderColor: borderColor || 'purple.400', boxShadow: borderColor ? `0 0 0 2px ${borderColor}` : undefined }}
        _hover={{ borderColor: borderColor }}
        sx={{
          borderColor: getBorderColorWithOpacity(),
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
        className={cn('w-full px-3 py-2 rounded-md', cleanClassName)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 