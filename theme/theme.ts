import { colors, ColorScheme } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

// Dark theme
export const darkTheme = {
  colors: {
    // Primary colors
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    
    // Background colors
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    cardBackground: colors.cardBackground,
    inputBackground: colors.inputBackground,
    modalBackground: colors.modalBackground,
    
    // Text colors
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textTertiary: colors.textTertiary,
    
    // Status colors
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    
    // Additional colors
    border: colors.border,
    overlay: colors.overlay,
    avatarColors: colors.avatarColors,
    
    // Tab bar colors
    tabBarBackground: colors.tabBarBackground,
    tabBarBorder: colors.tabBarBorder,
    tabBarActiveText: colors.tabBarActiveText,
    tabBarInactiveText: colors.tabBarInactiveText,
  },
  typography,
  spacing,
};

// Light theme
export const lightTheme = {
  colors: {
    // Primary colors
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    
    // Background colors
    background: colors.backgroundLight,
    surface: colors.surfaceLight,
    surfaceVariant: colors.surfaceVariantLight,
    cardBackground: colors.cardBackgroundLight,
    inputBackground: colors.inputBackgroundLight,
    modalBackground: colors.modalBackgroundLight,
    
    // Text colors
    textPrimary: colors.textPrimaryLight,
    textSecondary: colors.textSecondaryLight,
    textTertiary: colors.textTertiaryLight,
    
    // Status colors
    success: colors.successLight,
    error: colors.errorLight,
    warning: colors.warningLight,
    info: colors.infoLight,
    
    // Additional colors
    border: colors.borderLight,
    overlay: colors.overlayLight,
    avatarColors: colors.avatarColors,
    
    // Tab bar colors
    tabBarBackground: colors.tabBarBackgroundLight,
    tabBarBorder: colors.tabBarBorderLight,
    tabBarActiveText: colors.tabBarActiveText,
    tabBarInactiveText: colors.tabBarInactiveTextLight,
  },
  typography,
  spacing,
};

// Types for TypeScript
export type AppTheme = typeof darkTheme;
export type ThemeColors = typeof darkTheme.colors;

// Function to get theme by scheme
export const getTheme = (colorScheme: ColorScheme): AppTheme => {
  return colorScheme === 'light' ? lightTheme : darkTheme;
};

// Export for backward compatibility
export const theme = darkTheme; 