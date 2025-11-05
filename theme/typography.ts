import { TextStyle } from 'react-native';

// Typography styles for the app
export const typography = {
  // Headings
  h1: {
    fontSize: 26,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  
  // Body text
  bodyLarge: {
    fontSize: 17,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0.15,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0.25,
  },
  
  // Buttons
  buttonLarge: {
    fontSize: 18,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  buttonMedium: {
    fontSize: 17,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  buttonSmall: {
    fontSize: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  
  // Input fields
  input: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0.15,
  },
  
  // Labels
  label: {
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
  },
  
  // Special
  overline: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
};

// Types for TypeScript
export type TypographyVariant = keyof typeof typography; 