
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, Translations } from '@/types/translations';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof Translations, key: string) => string;
  translations: Translations;
  updateTranslation: (section: keyof Translations, key: string, value: string, lang: Language) => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language') as Language;
    return storedLang === 'fr' ? 'fr' : 'en';
  });

  const { 
    buildTranslations, 
    saveTranslationAsync, 
    isSaving,
    isLoading,
    migrateLocalStorageToDatabase 
  } = useCustomTranslations();

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    migrateLocalStorageToDatabase();
  }, [migrateLocalStorageToDatabase]);

  const translations = buildTranslations(language);

  const t = (section: keyof Translations, key: string): string => {
    try {
      const value = translations[section][key as keyof Translations[typeof section]];
      return value || key;
    } catch (error) {
      console.error(`Translation missing for ${section}.${key} in ${language}`);
      return key;
    }
  };

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
      isSaving,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language, Translations };
