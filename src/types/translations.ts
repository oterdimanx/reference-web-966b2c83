
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
