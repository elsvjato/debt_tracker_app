// Spacing system for the app
export const spacing = {
  // Base spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Special spacing
  headerPadding: 36,
  headerPaddingBottom: 16,
  screenPadding: 24,
  cardPadding: 16,
  buttonPadding: 14,
  inputPadding: 16,
  
  // Radii
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    round: 999,
  },
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Types for TypeScript
export type SpacingSize = keyof typeof spacing;
export type RadiusSize = keyof typeof spacing.radius;
export type ShadowSize = keyof typeof spacing.shadow; 