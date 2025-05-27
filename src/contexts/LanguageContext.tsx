
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, Translations } from '@/types/translations';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof Translations, key: string) => string;
  translations: Translations;
  updateTranslation: (section: keyof Translations, key: string, value: string, lang: Language) => Promise<void>;
  isSaving: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get stored language preference or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language') as Language;
    return storedLang === 'fr' ? 'fr' : 'en';
  });

  const { 
    buildTranslations, 
    saveTranslationAsync, 
    isSaving,
    migrateLocalStorageToDatabase 
  } = useCustomTranslations();

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Run migration once on mount
  useEffect(() => {
    migrateLocalStorageToDatabase();
  }, []);

  // Get current translations
  const translations = buildTranslations(language);

  // Translation function
  const t = (section: keyof Translations, key: string): string => {
    try {
      return translations[section][key as keyof Translations[typeof section]] || key;
    } catch (error) {
      console.error(`Translation missing for ${section}.${key} in ${language}`);
      return key;
    }
  };

  // Function to update translations (for admin use)
  const updateTranslation = async (section: keyof Translations, key: string, value: string, lang: Language) => {
    try {
      await saveTranslationAsync({
        language: lang,
        sectionKey: section,
        translationKey: key,
        value
      });
      console.log(`Updated ${lang} translation for ${section}.${key} to: ${value}`);
    } catch (error) {
      console.error('Error updating translation:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      translations, 
      updateTranslation,
      isSaving 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Create a hook for easy access to language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Re-export types for convenience
export type { Language, Translations };
