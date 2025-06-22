'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#faf5ff',
      100: '#e9d8fd',
      200: '#d6bcfa',
      300: '#b794f4',
      400: '#9f7aea',
      500: '#805ad5',
      600: '#6b46c1',
      700: '#553c9a',
      800: '#44337a',
      900: '#322659',
    },
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    purple: {
      50: '#faf5ff',
      100: '#e9d8fd',
      200: '#d6bcfa',
      300: '#b794f4',
      400: '#9f7aea',
      500: '#805ad5',
      600: '#6b46c1',
      700: '#553c9a',
      800: '#44337a',
      900: '#322659',
    },
    pink: {
      50: '#fed7e2',
      100: '#fbb6ce',
      200: '#f687b3',
      300: '#ed64a6',
      400: '#e53e3e',
      500: '#db2777',
      600: '#c53084',
      700: '#a31869',
      800: '#822727',
      900: '#521b41',
    },
  },
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
      variants: {
        filled: {
          field: {
            bg: 'gray.800',
            _hover: {
              bg: 'gray.700',
            },
            _focus: {
              bg: 'gray.700',
            },
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
      variants: {
        filled: {
          bg: 'gray.800',
          _hover: {
            bg: 'gray.700',
          },
          _focus: {
            bg: 'gray.700',
          },
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
} 