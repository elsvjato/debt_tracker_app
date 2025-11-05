import { useSettings } from './SettingsContext';
import { AppTheme } from './theme';

// Global theme hook
export const useTheme = (): AppTheme => {
  return useSettings().theme;
}; 