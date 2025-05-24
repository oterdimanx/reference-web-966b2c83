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
  aboutPage: {
    title: string;
    intro: string;
    missionTitle: string;
    missionText: string;
    teamTitle: string;
    teamText: string;
    technologyTitle: string;
    technologyText: string;
    contactTitle: string;
    contactText: string;
  };
  allWebsitesPage: {
    title: string;
    backToDashboard: string;
    completeWebsiteRankings: string;
    loadingWebsites: string;
    website: string;
    avgPosition: string;
    change: string;
    keywords: string;
    noWebsitesFound: string;
    viewAll: string;
    trackedWebsites: string;
  };
  addWebsiteForm: {
    pageTitle: string;
    websiteDetails: string;
    websiteDetailsDescription: string;
    websiteTitle: string;
    websiteTitlePlaceholder: string;
    websiteTitleDescription: string;
    websiteUrl: string;
    websiteUrlPlaceholder: string;
    websiteUrlDescription: string;
    description: string;
    descriptionPlaceholder: string;
    contactName: string;
    contactNamePlaceholder: string;
    contactEmail: string;
    contactEmailPlaceholder: string;
    countryCode: string;
    selectCountryCode: string;
    phoneNumber: string;
    phoneNumberPlaceholder: string;
    phoneNumberDescription: string;
    reciprocalLink: string;
    reciprocalLinkPlaceholder: string;
    reciprocalLinkDescription: string;
    keywords: string;
    keywordsPlaceholder: string;
    keywordsDescription: string;
    selectPlan: string;
    choosePricingPlan: string;
    selectPlanDescription: string;
    loadingPlans: string;
    noPlansAvailable: string;
    addingWebsite: string;
    addWebsiteButton: string;
    // Form validation messages
    titleRequired: string;
    domainRequired: string;
    descriptionRequired: string;
    contactNameRequired: string;
    invalidEmail: string;
    phoneRequired: string;
    phoneDigitsOnly: string;
    keywordsRequired: string;
    planRequired: string;
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
  aboutPage: {
    title: 'About Reference-Web',
    intro: 'Reference-Web is a powerful SEO ranking and website monitoring platform designed to help businesses and individuals track their online presence and improve their search engine rankings.',
    missionTitle: 'Our Mission',
    missionText: 'Our mission is to provide accessible and actionable insights into website performance, helping our users make data-driven decisions to improve their online visibility.',
    teamTitle: 'The Team',
    teamText: 'Founded by a team of SEO experts and web developers, Reference-Web combines technical expertise with user-friendly design to deliver a seamless experience.',
    technologyTitle: 'Our Technology',
    technologyText: 'We use cutting-edge technology to gather and analyze data from search engines, providing accurate and up-to-date information about your website\'s performance.',
    contactTitle: 'Contact Us',
    contactText: 'Have questions or feedback? We\'d love to hear from you! Contact our support team at support@reference-web.com.',
  },
  allWebsitesPage: {
    title: 'All Tracked Websites',
    backToDashboard: 'Back to Dashboard',
    completeWebsiteRankings: 'Complete Website Rankings',
    loadingWebsites: 'Loading websites...',
    website: 'Website',
    avgPosition: 'Avg Position',
    change: 'Change',
    keywords: 'Keywords',
    noWebsitesFound: 'No websites found. Add a website to start tracking.',
    viewAll: 'View All',
    trackedWebsites: 'Tracked Websites',
  },
  addWebsiteForm: {
    pageTitle: 'Add Website',
    websiteDetails: 'Website Details',
    websiteDetailsDescription: 'Enter information about the website you want to track',
    websiteTitle: 'Website Title',
    websiteTitlePlaceholder: 'My Awesome Website',
    websiteTitleDescription: 'The name or title of your website',
    websiteUrl: 'Website URL',
    websiteUrlPlaceholder: 'example.com',
    websiteUrlDescription: 'Enter the domain without http:// or https://',
    description: 'Description',
    descriptionPlaceholder: 'Brief description of your website',
    contactName: 'Contact Name',
    contactNamePlaceholder: 'John Doe',
    contactEmail: 'Contact Email',
    contactEmailPlaceholder: 'email@example.com',
    countryCode: 'Country Code',
    selectCountryCode: 'Select country code',
    phoneNumber: 'Phone Number',
    phoneNumberPlaceholder: '612345678',
    phoneNumberDescription: 'Enter only numbers without spaces or special characters',
    reciprocalLink: 'Reciprocal Link (Optional)',
    reciprocalLinkPlaceholder: 'https://example.com/partners/referencerank',
    reciprocalLinkDescription: 'Link back to our service from your website (optional)',
    keywords: 'Keywords',
    keywordsPlaceholder: 'seo, marketing, web design',
    keywordsDescription: 'Enter keywords separated by commas',
    selectPlan: 'Select a Plan',
    choosePricingPlan: 'Choose a pricing plan',
    selectPlanDescription: 'Choose the subscription plan for this website',
    loadingPlans: 'Loading plans...',
    noPlansAvailable: 'No plans available',
    addingWebsite: 'Adding Website...',
    addWebsiteButton: 'Add Website',
    // Form validation messages
    titleRequired: 'Title is required',
    domainRequired: 'Domain is required',
    descriptionRequired: 'Description is required',
    contactNameRequired: 'Contact name is required',
    invalidEmail: 'Invalid email address',
    phoneRequired: 'Phone number is required',
    phoneDigitsOnly: 'Phone number must contain only digits',
    keywordsRequired: 'At least one keyword is required',
    planRequired: 'Please select a pricing plan',
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
  aboutPage: {
    title: 'À propos de Reference-Web',
    intro: 'Reference-Web est une plateforme puissante de classement SEO et de surveillance de sites web conçue pour aider les entreprises et les particuliers à suivre leur présence en ligne et à améliorer leurs classements dans les moteurs de recherche.',
    missionTitle: 'Notre Mission',
    missionText: 'Notre mission est de fournir des informations accessibles et exploitables sur les performances des sites web, aidant nos utilisateurs à prendre des décisions basées sur les données pour améliorer leur visibilité en ligne.',
    teamTitle: 'L\'Équipe',
    teamText: 'Fondée par une équipe d\'experts SEO et de développeurs web, Reference-Web combine l\'expertise technique avec un design convivial pour offrir une expérience fluide.',
    technologyTitle: 'Notre Technologie',
    technologyText: 'Nous utilisons une technologie de pointe pour collecter et analyser les données des moteurs de recherche, fournissant des informations précises et à jour sur les performances de votre site web.',
    contactTitle: 'Contactez-nous',
    contactText: 'Vous avez des questions ou des commentaires ? Nous aimerions avoir de vos nouvelles ! Contactez notre équipe de support à support@reference-web.com.',
  },
  allWebsitesPage: {
    title: 'Tous les sites web suivis',
    backToDashboard: 'Retour au tableau de bord',
    completeWebsiteRankings: 'Classements complets des sites web',
    loadingWebsites: 'Chargement des sites web...',
    website: 'Site web',
    avgPosition: 'Position moyenne',
    change: 'Changement',
    keywords: 'Mots-clés',
    noWebsitesFound: 'Aucun site web trouvé. Ajoutez un site web pour commencer le suivi.',
    viewAll: 'Voir tout',
    trackedWebsites: 'Sites web suivis',
  },
  addWebsiteForm: {
    pageTitle: 'Ajouter un site web',
    websiteDetails: 'Détails du site web',
    websiteDetailsDescription: 'Entrez les informations sur le site web que vous voulez suivre',
    websiteTitle: 'Titre du site web',
    websiteTitlePlaceholder: 'Mon site web génial',
    websiteTitleDescription: 'Le nom ou titre de votre site web',
    websiteUrl: 'URL du site web',
    websiteUrlPlaceholder: 'exemple.com',
    websiteUrlDescription: 'Entrez le domaine sans http:// ou https://',
    description: 'Description',
    descriptionPlaceholder: 'Brève description de votre site web',
    contactName: 'Nom du contact',
    contactNamePlaceholder: 'Jean Dupont',
    contactEmail: 'Email du contact',
    contactEmailPlaceholder: 'email@exemple.com',
    countryCode: 'Indicatif pays',
    selectCountryCode: 'Sélectionner l\'indicatif pays',
    phoneNumber: 'Numéro de téléphone',
    phoneNumberPlaceholder: '612345678',
    phoneNumberDescription: 'Entrez uniquement des chiffres sans espaces ou caractères spéciaux',
    reciprocalLink: 'Lien réciproque (Optionnel)',
    reciprocalLinkPlaceholder: 'https://exemple.com/partenaires/referencerank',
    reciprocalLinkDescription: 'Lien de retour vers notre service depuis votre site web (optionnel)',
    keywords: 'Mots-clés',
    keywordsPlaceholder: 'seo, marketing, conception web',
    keywordsDescription: 'Entrez les mots-clés séparés par des virgules',
    selectPlan: 'Sélectionner un plan',
    choosePricingPlan: 'Choisir un plan tarifaire',
    selectPlanDescription: 'Choisissez le plan d\'abonnement pour ce site web',
    loadingPlans: 'Chargement des plans...',
    noPlansAvailable: 'Aucun plan disponible',
    addingWebsite: 'Ajout du site web...',
    addWebsiteButton: 'Ajouter le site web',
    // Form validation messages
    titleRequired: 'Le titre est requis',
    domainRequired: 'Le domaine est requis',
    descriptionRequired: 'La description est requise',
    contactNameRequired: 'Le nom du contact est requis',
    invalidEmail: 'Adresse email invalide',
    phoneRequired: 'Le numéro de téléphone est requis',
    phoneDigitsOnly: 'Le numéro de téléphone ne doit contenir que des chiffres',
    keywordsRequired: 'Au moins un mot-clé est requis',
    planRequired: 'Veuillez sélectionner un plan tarifaire',
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
