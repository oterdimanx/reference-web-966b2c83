
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, Translations } from '@/types/translations';
import { enTranslations } from '@/translations/en';
import { frTranslations } from '@/translations/fr';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof Translations, key: string) => string;
  translations: Translations;
  updateTranslation: (section: keyof Translations, key: string, value: string, lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get stored language preference or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language') as Language;
    return storedLang === 'fr' ? 'fr' : 'en';
  });

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Store translations in state so they can be updated
  const [translations, setTranslations] = useState(() => {
    // Try to load custom translations from localStorage
    const customTranslations = localStorage.getItem('customTranslations');
    if (customTranslations) {
      try {
        const parsed = JSON.parse(customTranslations);
        return {
          en: { ...enTranslations, ...parsed.en },
          fr: { ...frTranslations, ...parsed.fr }
        };
      } catch (error) {
        console.error('Error parsing custom translations:', error);
      }
    }
    
    return {
      en: enTranslations,
      fr: frTranslations
    };
  });

  // Translation function
  const t = (section: keyof Translations, key: string): string => {
    try {
      return translations[language][section][key as keyof Translations[typeof section]] || key;
    } catch (error) {
      console.error(`Translation missing for ${section}.${key} in ${language}`);
      return key;
    }
  };

  // Function to update translations (for admin use)
  const updateTranslation = (section: keyof Translations, key: string, value: string, lang: Language) => {
    setTranslations(prev => {
      const updated = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [section]: {
            ...prev[lang][section],
            [key]: value
          }
        }
      };
      
      // Save all custom translations to localStorage
      const customTranslations = {
        en: {},
        fr: {}
      };
      
      // For English translations, save all that differ from original
      const enSections = updated.en;
      Object.keys(enSections).forEach(sectionKey => {
        const sectionName = sectionKey as keyof Translations;
        const sectionData = enSections[sectionName];
        const originalSection = enTranslations[sectionName];
        
        Object.keys(sectionData).forEach(translationKey => {
          const currentValue = sectionData[translationKey as keyof typeof sectionData];
          const originalValue = originalSection[translationKey as keyof typeof originalSection];
          
          if (currentValue !== originalValue) {
            if (!customTranslations.en[sectionName]) {
              customTranslations.en[sectionName] = {};
            }
            customTranslations.en[sectionName][translationKey] = currentValue;
          }
        });
      });
      
      // For French translations, save all that differ from original
      const frSections = updated.fr;
      Object.keys(frSections).forEach(sectionKey => {
        const sectionName = sectionKey as keyof Translations;
        const sectionData = frSections[sectionName];
        const originalSection = frTranslations[sectionName];
        
        Object.keys(sectionData).forEach(translationKey => {
          const currentValue = sectionData[translationKey as keyof typeof sectionData];
          const originalValue = originalSection[translationKey as keyof typeof originalSection];
          
          if (currentValue !== originalValue) {
            if (!customTranslations.fr[sectionName]) {
              customTranslations.fr[sectionName] = {};
            }
            customTranslations.fr[sectionName][translationKey] = currentValue;
          }
        });
      });
      
      localStorage.setItem('customTranslations', JSON.stringify(customTranslations));
      
      return updated;
    });
    
    console.log(`Updated ${lang} translation for ${section}.${key} to: ${value}`);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language], updateTranslation }}>
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
