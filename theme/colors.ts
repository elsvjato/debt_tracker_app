// Centralized colors for the app
export const colors = {
  // Primary colors (yellow accents)
  primary: '#FFC107',
  primaryDark: '#FFB300',
  primaryLight: '#FFD54F',
  
  // Background colors
  background: '#18181b',
  backgroundLight: '#FFFFFF',
  surface: '#23232a',
  surfaceLight: '#F8F9FA',
  surfaceVariant: '#2A2A2A',
  surfaceVariantLight: '#F1F3F4',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textPrimaryLight: '#1A1A1A',
  textSecondary: '#A0A0A0',
  textSecondaryLight: '#5F6368',
  textTertiary: '#6B7280',
  textTertiaryLight: '#9AA0A6',
  
  // Status colors
  success: '#10B981',
  successLight: '#059669',
  error: '#EF4444',
  errorLight: '#DC2626',
  warning: '#F59E0B',
  warningLight: '#D97706',
  info: '#3B82F6',
  infoLight: '#2563EB',
  
  // Additional colors
  border: '#374151',
  borderLight: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  
  // Special colors
  cardBackground: '#23232a',
  cardBackgroundLight: '#FFFFFF',
  inputBackground: '#23232a',
  inputBackgroundLight: '#F9FAFB',
  modalBackground: '#23232a',
  modalBackgroundLight: '#FFFFFF',

  // Tab bar colors
  tabBarBackground: '#1F1F23',
  tabBarBackgroundLight: '#FFFFFF',
  tabBarBorder: '#2A2A2A',
  tabBarBorderLight: '#E5E7EB',
  tabBarActiveText: '#FFC107',
  tabBarInactiveText: '#6B7280',
  tabBarInactiveTextLight: '#9AA0A6',

  // Avatars (pastel backgrounds)
  avatarColors: [
    '#E6F4EA', '#FDEFEF', '#EAF0FB', '#F9F6E7', '#F6EAF7', '#EAF6F6'
  ],
};

export const lightColors = {
  background: '#F9FAFB',         // very light background (not pure white)
  surface: '#fff',               // cards, blocks
  primary: '#FFC107',            // main yellow accent (buttons, active elements)
  primaryDark: '#FFB300',        // darker yellow for pressed/active states
  accent: '#FFD600',             // additional accent (icons, underlines)
  textPrimary: '#1A1A1A',        // main text (very dark gray)
  textSecondary: '#5F6368',      // secondary text (gray)
  border: '#E5E7EB',             // borders, dividers
  error: '#EF4444',              // errors
  success: '#10B981',            // success
  cardShadow: 'rgba(255,193,7,0.08)', // light yellow shadow for cards
};

// Types for TypeScript
export type ColorScheme = 'dark' | 'light';
export type AppColors = typeof colors; 