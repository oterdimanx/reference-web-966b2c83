
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'fr';

// Define translation keys structure
export interface Translations {
  common: {
    home: string;
    about: string;
    allWebsites: string;
    addWebsite: string;
    login: string;
    signOut: string;
    profile: string;
    admin: string;
    returnToFront: string;
    // Footer links
    privacyPolicy: string;
    termsOfService: string;
    copyright: string;
  };
  admin: {
    dashboard: string;
    pricing: string;
    userManagement: string;
    navigationTitle: string;
    totalUsers: string;
    totalWebsites: string;
    pricingPlans: string;
    recentActivity: string;
    welcomeMessage: string;
    translationManager: string;
    commonTexts: string;
    adminTexts: string;
    homepageTexts: string;
    saveTranslations: string;
  };
  homepage: {
    title: string;
    subtitle: string;
    getStarted: string;
    // New homepage sections
    featuresTitle: string;
    rankingsSection: string;
    keywordsSection: string;
  };
  pages: {
    // Page titles
    rankings: string;
    keywords: string;
    about: string;
    profile: string;
    addWebsite: string;
    allWebsites: string;
    // Section titles
    rankingsTitle: string;
    keywordsTitle: string;
    monitorRankings: string;
    optimizeKeywords: string;
    whyTrackRankings: string;
    whyKeywordResearch: string;
    yourWebsiteRankings: string;
    yourKeywords: string;
  };
}

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof Translations, key: string) => string;
  translations: Translations;
  updateTranslation: (section: keyof Translations, key: string, value: string, lang: Language) => void;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const enTranslations: Translations = {
  common: {
    home: 'Home',
    about: 'About',
    allWebsites: 'All Websites',
    addWebsite: 'Add Website',
    login: 'Login',
    signOut: 'Sign out',
    profile: 'Profile',
    admin: 'Admin Dashboard',
    returnToFront: 'Return to Front',
    // Footer links
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    copyright: '© {year} Reference-Web. All rights reserved.',
  },
  admin: {
    dashboard: 'Dashboard',
    pricing: 'Pricing Plans',
    userManagement: 'User Management',
    navigationTitle: 'Admin Navigation',
    totalUsers: 'Total Users',
    totalWebsites: 'Total Websites',
    pricingPlans: 'Pricing Plans',
    recentActivity: 'Recent Activity',
    welcomeMessage: 'Welcome to the admin dashboard. Use the navigation above to manage different aspects of your application.',
    translationManager: 'Translation Manager',
    commonTexts: 'Common Texts',
    adminTexts: 'Admin Texts',
    homepageTexts: 'Homepage Texts',
    saveTranslations: 'Save English Translations',
  },
  homepage: {
    title: 'Reference-Web',
    subtitle: 'Track and manage your website rankings',
    getStarted: 'Get Started',
    // New homepage sections
    featuresTitle: 'Our Features',
    rankingsSection: 'Track Rankings',
    keywordsSection: 'Keyword Research',
  },
  pages: {
    // Page titles
    rankings: 'Rankings',
    keywords: 'Keywords',
    about: 'About Us',
    profile: 'User Profile',
    addWebsite: 'Add Website',
    allWebsites: 'All Websites',
    // Section titles
    rankingsTitle: 'Your Website Rankings',
    keywordsTitle: 'Your Keywords',
    monitorRankings: 'Monitor Your Website Rankings',
    optimizeKeywords: 'Optimize Your Keyword Strategy',
    whyTrackRankings: 'Why Track Your Rankings?',
    whyKeywordResearch: 'Why Keyword Research Matters',
    yourWebsiteRankings: 'Your Website Rankings',
    yourKeywords: 'Your Keywords',
  },
};

// French translations
const frTranslations: Translations = {
  common: {
    home: 'Accueil',
    about: 'À propos',
    allWebsites: 'Tous les sites',
    addWebsite: 'Ajouter un site',
    login: 'Connexion',
    signOut: 'Déconnexion',
    profile: 'Profil',
    admin: 'Tableau de bord admin',
    returnToFront: 'Retour au site',
    // Footer links
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    copyright: '© {year} Reference-Web. Tous droits réservés.',
  },
  admin: {
    dashboard: 'Tableau de bord',
    pricing: 'Plans tarifaires',
    userManagement: 'Gestion des utilisateurs',
    navigationTitle: 'Navigation Admin',
    totalUsers: 'Total utilisateurs',
    totalWebsites: 'Total sites web',
    pricingPlans: 'Plans tarifaires',
    recentActivity: 'Activité récente',
    welcomeMessage: 'Bienvenue sur le tableau de bord administrateur. Utilisez la navigation ci-dessus pour gérer différents aspects de votre application.',
    translationManager: 'Gestionnaire de traductions',
    commonTexts: 'Textes communs',
    adminTexts: 'Textes administrateur',
    homepageTexts: 'Textes de la page d\'accueil',
    saveTranslations: 'Sauvegarder les traductions françaises',
  },
  homepage: {
    title: 'Reference-Web',
    subtitle: 'Suivez et gérez les classements de votre site web',
    getStarted: 'Commencer',
    // New homepage sections
    featuresTitle: 'Nos fonctionnalités',
    rankingsSection: 'Suivre les classements',
    keywordsSection: 'Recherche de mots-clés',
  },
  pages: {
    // Page titles
    rankings: 'Classements',
    keywords: 'Mots-clés',
    about: 'À propos de nous',
    profile: 'Profil utilisateur',
    addWebsite: 'Ajouter un site web',
    allWebsites: 'Tous les sites web',
    // Section titles
    rankingsTitle: 'Classements de votre site web',
    keywordsTitle: 'Vos mots-clés',
    monitorRankings: 'Surveillez les classements de votre site web',
    optimizeKeywords: 'Optimisez votre stratégie de mots-clés',
    whyTrackRankings: 'Pourquoi suivre vos classements ?',
    whyKeywordResearch: 'Pourquoi la recherche de mots-clés est importante',
    yourWebsiteRankings: 'Classements de votre site web',
    yourKeywords: 'Vos mots-clés',
  },
};

// Create the Language Provider component
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
  const [translations, setTranslations] = useState({
    en: enTranslations,
    fr: frTranslations
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
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...prev[lang][section],
          [key]: value
        }
      }
    }));
    
    // In a real app, we would save this to a database
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
