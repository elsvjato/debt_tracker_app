import { StyleSheet } from 'react-native';
import { spacing } from './spacing';
import { darkTheme } from './theme';

// Global component styles
export const globalStyles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  
  // Headers
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.headerPadding,
    paddingBottom: spacing.headerPaddingBottom,
  },
  
  headerRowWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.headerPadding,
    paddingBottom: spacing.headerPaddingBottom,
  },
  
  headerTitle: {
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.h2.fontSize,
    fontWeight: darkTheme.typography.h2.fontWeight,
    textAlign: 'center',
    letterSpacing: darkTheme.typography.h2.letterSpacing,
  },
  
  headerTitleWithBack: {
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.h2.fontSize,
    fontWeight: darkTheme.typography.h2.fontWeight,
    flex: 1,
    letterSpacing: darkTheme.typography.h2.letterSpacing,
  },
  
  // Buttons
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  
  button: {
    backgroundColor: darkTheme.colors.primary,
    borderRadius: spacing.radius.xl,
    paddingVertical: spacing.buttonPadding,
    alignItems: 'center',
  },
  
  buttonSecondary: {
    borderWidth: 2,
    borderColor: darkTheme.colors.primary,
    borderRadius: spacing.radius.xl,
    paddingVertical: spacing.buttonPadding,
    alignItems: 'center',
  },
  
  buttonText: {
    color: darkTheme.colors.background,
    fontSize: darkTheme.typography.buttonMedium.fontSize,
    fontWeight: darkTheme.typography.buttonMedium.fontWeight,
  },
  
  buttonTextSecondary: {
    color: darkTheme.colors.primary,
    fontSize: darkTheme.typography.buttonMedium.fontSize,
    fontWeight: darkTheme.typography.buttonMedium.fontWeight,
  },
  
  // Input fields
  input: {
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.inputPadding,
    paddingVertical: spacing.inputPadding,
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.input.fontSize,
    fontWeight: darkTheme.typography.input.fontWeight,
  },
  
  inputError: {
    borderColor: darkTheme.colors.error,
    borderWidth: 1,
  },
  
  // Modal windows
  modalOverlay: {
    flex: 1,
    backgroundColor: darkTheme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: darkTheme.colors.modalBackground,
    borderRadius: spacing.radius.lg,
    padding: spacing.xxl,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
  },
  
  modalTitle: {
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.h3.fontSize,
    fontWeight: darkTheme.typography.h3.fontWeight,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  modalText: {
    color: darkTheme.colors.textSecondary,
    fontSize: darkTheme.typography.bodyMedium.fontSize,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  
  // Cards
  card: {
    backgroundColor: darkTheme.colors.cardBackground,
    borderRadius: spacing.radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    ...spacing.shadow.small,
  },
  
  // Sections
  section: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xxxl,
  },
  
  optionsSection: {
    marginHorizontal: spacing.screenPadding,
    borderRadius: spacing.radius.md,
    backgroundColor: darkTheme.colors.cardBackground,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxxl,
    ...spacing.shadow.small,
  },
  
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.colors.border,
  },
  
  optionText: {
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.bodyLarge.fontSize,
    fontWeight: darkTheme.typography.bodyLarge.fontWeight,
    flex: 1,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.colors.cardBackground,
    borderRadius: spacing.radius.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  
  searchInput: {
    flex: 1,
    color: darkTheme.colors.textPrimary,
    fontSize: darkTheme.typography.bodyMedium.fontSize,
    paddingVertical: spacing.md,
  },
  
  // Lists
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Errors
  errorText: {
    color: darkTheme.colors.error,
    fontSize: darkTheme.typography.bodySmall.fontSize,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  
  // Loading
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: darkTheme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Avatars
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.colors.surface,
  },
  
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: darkTheme.colors.surface,
  },
  
  // Texts
  textPrimary: {
    color: darkTheme.colors.textPrimary,
  },
  
  textSecondary: {
    color: darkTheme.colors.textSecondary,
  },
  
  textTertiary: {
    color: darkTheme.colors.textTertiary,
  },
  
  // Spacing
  paddingHorizontal: {
    paddingHorizontal: spacing.screenPadding,
  },
  
  marginBottom: {
    marginBottom: spacing.lg,
  },
  
  marginTop: {
    marginTop: spacing.lg,
  },
});

// Function to create dynamic styles with theme
export const createThemedStyles = (theme: typeof darkTheme) => {
  return StyleSheet.create({
    container: {
      ...globalStyles.container,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      ...globalStyles.headerTitle,
      color: theme.colors.textPrimary,
    },
    input: {
      ...globalStyles.input,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.textPrimary,
    },
    // Add other styles as needed
  });
}; 