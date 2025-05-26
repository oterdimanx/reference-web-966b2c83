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
    // Add Website section
    addWebsiteTitle: string;
    addWebsiteDescription: string;
    websiteUrlLabel: string;
    websiteUrlPlaceholder: string;
    keywordsLabel: string;
    keywordsPlaceholder: string;
    keywordsHelp: string;
    paymentInfo: string;
    continueToFormButton: string;
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
  legalPages: {
    privacyTitle: string;
    privacyLastUpdated: string;
    privacyIntroduction: string;
    privacyIntroText: string;
    privacyInfoCollectedTitle: string;
    privacyInfoCollectedText: string;
    privacyInfoCollectedList1: string;
    privacyInfoCollectedList2: string;
    privacyInfoCollectedList3: string;
    privacyInfoCollectedList4: string;
    privacyHowWeUseTitle: string;
    privacyHowWeUseText: string;
    privacyHowWeUseList1: string;
    privacyHowWeUseList2: string;
    privacyHowWeUseList3: string;
    privacyHowWeUseList4: string;
    privacyHowWeUseList5: string;
    privacyDataSharingTitle: string;
    privacyDataSharingText: string;
    privacyDataSharingList1: string;
    privacyDataSharingList2: string;
    privacyDataSharingList3: string;
    privacyYourRightsTitle: string;
    privacyYourRightsText: string;
    privacyChangesTitle: string;
    privacyChangesText: string;
    privacyContactTitle: string;
    privacyContactText: string;
    termsTitle: string;
    termsLastUpdated: string;
    termsIntroductionTitle: string;
    termsIntroductionText: string;
    termsAccountsTitle: string;
    termsAccountsText: string;
    termsUsageTitle: string;
    termsUsageText: string;
    termsUsageList1: string;
    termsUsageList2: string;
    termsUsageList3: string;
    termsUsageList4: string;
    termsUsageList5: string;
    termsContentTitle: string;
    termsContentText: string;
    termsSubscriptionTitle: string;
    termsSubscriptionText: string;
    termsTerminationTitle: string;
    termsTerminationText: string;
    termsLiabilityTitle: string;
    termsLiabilityText: string;
    termsChangesTitle: string;
    termsChangesText: string;
    termsContactTitle: string;
    termsContactText: string;
  };
  quickTips: {
    title: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
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
    // Add Website section
    addWebsiteTitle: 'Add Website',
    addWebsiteDescription: 'Enter a website URL and keywords you want to track. Complete the form first, then payment.',
    websiteUrlLabel: 'Website URL',
    websiteUrlPlaceholder: 'example.com',
    keywordsLabel: 'Keywords (comma separated)',
    keywordsPlaceholder: 'seo, marketing, website design',
    keywordsHelp: 'Enter up to 10 keywords you want to track for this website',
    paymentInfo: '💳 Payment: Starting at 1€ (after form validation)',
    continueToFormButton: 'Continue to Form',
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
  legalPages: {
    privacyTitle: 'Privacy Policy',
    privacyLastUpdated: 'Last updated: May 20, 2025',
    privacyIntroduction: 'Introduction',
    privacyIntroText: 'Reference-Web ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your information when you use our website and services.',
    privacyInfoCollectedTitle: 'Information We Collect',
    privacyInfoCollectedText: 'We collect information you provide directly to us, such as when you create an account, subscribe to updates, or contact us for support. This may include:',
    privacyInfoCollectedList1: 'Contact information (name, email address)',
    privacyInfoCollectedList2: 'Account credentials',
    privacyInfoCollectedList3: 'Website URLs and domains you submit for tracking',
    privacyInfoCollectedList4: 'Keywords you wish to monitor',
    privacyHowWeUseTitle: 'How We Use Your Information',
    privacyHowWeUseText: 'We use the information we collect to:',
    privacyHowWeUseList1: 'Provide, maintain, and improve our services',
    privacyHowWeUseList2: 'Process and complete transactions',
    privacyHowWeUseList3: 'Send you technical notices and support messages',
    privacyHowWeUseList4: 'Respond to your comments and questions',
    privacyHowWeUseList5: 'Monitor and analyze trends, usage, and activities',
    privacyDataSharingTitle: 'Data Sharing',
    privacyDataSharingText: 'We may share your information with:',
    privacyDataSharingList1: 'Service providers who perform functions on our behalf',
    privacyDataSharingList2: 'Business partners with your consent',
    privacyDataSharingList3: 'Legal authorities when required by law',
    privacyYourRightsTitle: 'Your Rights',
    privacyYourRightsText: 'You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@reference-web.com.',
    privacyChangesTitle: 'Changes to This Policy',
    privacyChangesText: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
    privacyContactTitle: 'Contact Us',
    privacyContactText: 'If you have any questions about this Privacy Policy, please contact us at privacy@reference-web.com.',
    termsTitle: 'Terms of Service',
    termsLastUpdated: 'Last updated: May 20, 2025',
    termsIntroductionTitle: '1. Introduction',
    termsIntroductionText: 'By accessing or using Reference-Web ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.',
    termsAccountsTitle: '2. User Accounts',
    termsAccountsText: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities under your account.',
    termsUsageTitle: '3. Service Usage',
    termsUsageText: 'Users may not use the Service to:',
    termsUsageList1: 'Violate any laws or regulations',
    termsUsageList2: 'Infringe upon intellectual property rights',
    termsUsageList3: 'Transmit harmful code or malware',
    termsUsageList4: 'Attempt to gain unauthorized access to systems',
    termsUsageList5: 'Harvest or collect data without consent',
    termsContentTitle: '4. Content Ownership',
    termsContentText: 'The Service and its contents are owned by Reference-Web and are protected by copyright, trademark, and other intellectual property laws.',
    termsSubscriptionTitle: '5. Subscription and Payments',
    termsSubscriptionText: 'Some features of the Service require a subscription. You agree to pay all fees associated with your subscription plan. Fees are non-refundable except as required by law.',
    termsTerminationTitle: '6. Termination',
    termsTerminationText: 'We may terminate or suspend your account at any time, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties.',
    termsLiabilityTitle: '7. Limitation of Liability',
    termsLiabilityText: 'To the maximum extent permitted by law, Reference-Web shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.',
    termsChangesTitle: '8. Changes to Terms',
    termsChangesText: 'We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page and updating the "Last updated" date.',
    termsContactTitle: '9. Contact Us',
    termsContactText: 'If you have any questions about these Terms, please contact us at legal@reference-web.com.',
  },
  quickTips: {
    title: 'Quick Tips',
    tip1: 'Focus on high-volume, low-competition keywords',
    tip2: 'Update your content regularly to improve rankings',
    tip3: 'Build quality backlinks to boost your domain authority',
    tip4: 'Optimize page speed for better user experience and rankings',
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
    // Add Website section
    addWebsiteTitle: 'Ajouter un site web',
    addWebsiteDescription: 'Entrez une URL de site web et les mots-clés que vous voulez suivre. Complétez le formulaire d\'abord, puis le paiement.',
    websiteUrlLabel: 'URL du site web',
    websiteUrlPlaceholder: 'exemple.com',
    keywordsLabel: 'Mots-clés (séparés par des virgules)',
    keywordsPlaceholder: 'seo, marketing, conception web',
    keywordsHelp: 'Entrez jusqu\'à 10 mots-clés que vous voulez suivre pour ce site web',
    paymentInfo: '💳 Paiement : À partir de 1€ (après validation du formulaire)',
    continueToFormButton: 'Continuer vers le formulaire',
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
  legalPages: {
    privacyTitle: 'Politique de confidentialité',
    privacyLastUpdated: 'Dernière mise à jour : 20 mai 2025',
    privacyIntroduction: 'Introduction',
    privacyIntroText: 'Reference-Web (« nous », « notre » ou « nos ») s\'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et partageons vos informations lorsque vous utilisez notre site web et nos services.',
    privacyInfoCollectedTitle: 'Informations que nous collectons',
    privacyInfoCollectedText: 'Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, vous abonnez aux mises à jour ou nous contactez pour obtenir de l\'aide. Cela peut inclure :',
    privacyInfoCollectedList1: 'Informations de contact (nom, adresse e-mail)',
    privacyInfoCollectedList2: 'Identifiants de compte',
    privacyInfoCollectedList3: 'URLs et domaines de sites web que vous soumettez pour le suivi',
    privacyInfoCollectedList4: 'Mots-clés que vous souhaitez surveiller',
    privacyHowWeUseTitle: 'Comment nous utilisons vos informations',
    privacyHowWeUseText: 'Nous utilisons les informations que nous collectons pour :',
    privacyHowWeUseList1: 'Fournir, maintenir et améliorer nos services',
    privacyHowWeUseList2: 'Traiter et compléter les transactions',
    privacyHowWeUseList3: 'Vous envoyer des avis techniques et des messages de support',
    privacyHowWeUseList4: 'Répondre à vos commentaires et questions',
    privacyHowWeUseList5: 'Surveiller et analyser les tendances, l\'utilisation et les activités',
    privacyDataSharingTitle: 'Partage des données',
    privacyDataSharingText: 'Nous pouvons partager vos informations avec :',
    privacyDataSharingList1: 'Fournisseurs de services qui exécutent des fonctions en notre nom',
    privacyDataSharingList2: 'Partenaires commerciaux avec votre consentement',
    privacyDataSharingList3: 'Autorités légales lorsque requis par la loi',
    privacyYourRightsTitle: 'Vos droits',
    privacyYourRightsText: 'Vous avez le droit d\'accéder, de corriger ou de supprimer vos informations personnelles. Pour exercer ces droits, veuillez nous contacter à privacy@reference-web.com.',
    privacyChangesTitle: 'Modifications de cette politique',
    privacyChangesText: 'Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page et en mettant à jour la date de "Dernière mise à jour".',
    privacyContactTitle: 'Contactez-nous',
    privacyContactText: 'Si vous avez des questions sur cette politique de confidentialité, veuillez nous contacter à privacy@reference-web.com.',
    termsTitle: 'Conditions d\'utilisation',
    termsLastUpdated: 'Dernière mise à jour : 20 mai 2025',
    termsIntroductionTitle: '1. Introduction',
    termsIntroductionText: 'En accédant ou en utilisant Reference-Web (« le Service »), vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'êtes pas d\'accord avec une partie des conditions, vous ne pouvez pas accéder au Service.',
    termsAccountsTitle: '2. Comptes utilisateur',
    termsAccountsText: 'Lorsque vous créez un compte chez nous, vous devez fournir des informations exactes, complètes et actuelles. Vous êtes responsable de la protection du mot de passe et de toutes les activités sous votre compte.',
    termsUsageTitle: '3. Utilisation du service',
    termsUsageText: 'Les utilisateurs ne peuvent pas utiliser le Service pour :',
    termsUsageList1: 'Violer des lois ou réglementations',
    termsUsageList2: 'Porter atteinte aux droits de propriété intellectuelle',
    termsUsageList3: 'Transmettre du code nuisible ou des logiciels malveillants',
    termsUsageList4: 'Tenter d\'obtenir un accès non autorisé aux systèmes',
    termsUsageList5: 'Récolter ou collecter des données sans consentement',
    termsContentTitle: '4. Propriété du contenu',
    termsContentText: 'Le Service et son contenu appartiennent à Reference-Web et sont protégés par le droit d\'auteur, les marques de commerce et d\'autres lois sur la propriété intellectuelle.',
    termsSubscriptionTitle: '5. Abonnement et paiements',
    termsSubscriptionText: 'Certaines fonctionnalités du Service nécessitent un abonnement. Vous acceptez de payer tous les frais associés à votre plan d\'abonnement. Les frais ne sont pas remboursables sauf si requis par la loi.',
    termsTerminationTitle: '6. Résiliation',
    termsTerminationText: 'Nous pouvons résilier ou suspendre votre compte à tout moment, sans préavis, pour une conduite que nous déterminons violer ces Conditions ou être nuisible à d\'autres utilisateurs, à nous ou à des tiers.',
    termsLiabilityTitle: '7. Limitation de responsabilité',
    termsLiabilityText: 'Dans la mesure maximale permise par la loi, Reference-Web ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs résultant de votre utilisation du Service.',
    termsChangesTitle: '8. Modifications des conditions',
    termsChangesText: 'Nous nous réservons le droit de modifier ces Conditions à tout moment. Nous informerons les utilisateurs des changements importants en publiant les nouvelles Conditions sur cette page et en mettant à jour la date de "Dernière mise à jour".',
    termsContactTitle: '9. Contactez-nous',
    termsContactText: 'Si vous avez des questions sur ces Conditions, veuillez nous contacter à legal@reference-web.com.',
  },
  quickTips: {
    title: 'Conseils rapides',
    tip1: 'Concentrez-vous sur des mots-clés à fort volume et faible concurrence',
    tip2: 'Mettez à jour votre contenu régulièrement pour améliorer les classements',
    tip3: 'Construisez des liens de qualité pour augmenter l\'autorité de votre domaine',
    tip4: 'Optimisez la vitesse de page pour une meilleure expérience utilisateur et classements',
  },
};

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
