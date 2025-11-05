import { useSettings } from '../theme/SettingsContext';
import { getNestedTranslation, translations } from './translations';


export const useTranslation = () => {
  const { settings } = useSettings();
  const currentLanguage = settings.language;
  
  const t = (key: string, fallback?: string): string => {
    // Check if current language exists in translations
    const availableLanguage = translations[currentLanguage as keyof typeof translations] ? currentLanguage : 'en';
    let translation = getNestedTranslation(translations[availableLanguage], key);
    // If translation not found or empty, try English
    if (!translation || translation === key) {
      if (availableLanguage !== 'en') {
      const englishTranslation = getNestedTranslation(translations.en, key);
        if (englishTranslation && englishTranslation !== key) {
        return englishTranslation;
        }
      }
      // If fallback is provided, return it, otherwise return the key
      return fallback || key;
    }
    return translation;
  };
  
  const getCurrentLanguage = (): string => {
    return currentLanguage;
  };
  
  const isRTL = (): boolean => {
    // Add RTL languages here if needed
    return false;
  };
  
  const getAvailableLanguages = () => {
    return Object.keys(translations);
  };
  
  const getLanguageName = (langCode: string): string => {
    const languageNames = {
      en: 'English',
      uk: 'Українська'
    };
    return languageNames[langCode as keyof typeof languageNames] || langCode;
  };
  
  return {
    t,
    currentLanguage,
    getCurrentLanguage,
    isRTL,
    getAvailableLanguages,
    getLanguageName,
  };
};

export type TranslationHook = ReturnType<typeof useTranslation>; 