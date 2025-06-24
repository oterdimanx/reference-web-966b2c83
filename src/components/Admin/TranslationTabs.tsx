
import { Language, Translations } from '@/contexts/LanguageContext';
import { TranslationSection } from './TranslationSection';
import { SectionGroup } from './SectionGroup';
import { Globe, FileText, Scale, Lightbulb } from 'lucide-react';

interface TranslationTabsProps {
  language: Language;
  currentTranslations: Translations;
  onTranslationChange: (section: keyof Translations, key: string, value: string) => Promise<void>;
  openSections: {
    core: boolean;
    pages: boolean;
    legal: boolean;
    features: boolean;
  };
  toggleSection: (section: keyof typeof openSections) => void;
}

export function TranslationTabs({ 
  language, 
  currentTranslations, 
  onTranslationChange, 
  openSections, 
  toggleSection 
}: TranslationTabsProps) {
  const isEnglish = language === 'en';

  return (
    <>
      <SectionGroup 
        title={isEnglish ? "Core Application Texts" : "Textes de l'application principale"} 
        icon={Globe} 
        colorClass="bg-blue-600" 
        groupKey="core"
        isOpen={openSections.core}
        onToggle={() => toggleSection('core')}
      >
        <TranslationSection
          title={isEnglish ? "Common Texts" : "Textes communs"}
          sectionKey="common"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-blue-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Admin Texts" : "Textes administrateur"}
          sectionKey="admin"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-blue-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Homepage Texts" : "Textes de la page d'accueil"}
          sectionKey="homepage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-blue-600"
          language={language}
        />
      </SectionGroup>
      
      <SectionGroup 
        title={isEnglish ? "Feature Pages" : "Pages de fonctionnalités"} 
        icon={FileText} 
        colorClass="bg-purple-600" 
        groupKey="pages"
        isOpen={openSections.pages}
        onToggle={() => toggleSection('pages')}
      >
        <TranslationSection
          title={isEnglish ? "General Page Texts" : "Textes des pages généraux"}
          sectionKey="pages"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Profile Page" : "Page Profil"}
          sectionKey="profilePage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Directory Page" : "Page Répertoire"}
          sectionKey="directoryPage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "About Page" : "Page À propos"}
          sectionKey="aboutPage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "All Websites Page" : "Page Tous les sites web"}
          sectionKey="allWebsitesPage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Add Website Form" : "Formulaire d'ajout de site web"}
          sectionKey="addWebsiteForm"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
        
        <TranslationSection
          title={isEnglish ? "Pricing Page" : "Page de tarification"}
          sectionKey="pricingPage"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-purple-600"
          language={language}
        />
      </SectionGroup>

      <SectionGroup 
        title={isEnglish ? "Legal Pages" : "Pages légales"} 
        icon={Scale} 
        colorClass="bg-gray-700" 
        groupKey="legal"
        isOpen={openSections.legal}
        onToggle={() => toggleSection('legal')}
      >
        <TranslationSection
          title={isEnglish ? "Privacy Policy & Terms of Service" : "Politique de confidentialité & Conditions d'utilisation"}
          sectionKey="legalPages"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-gray-700"
          language={language}
        />
      </SectionGroup>
      
      <SectionGroup 
        title={isEnglish ? "Features & Components" : "Fonctionnalités & Composants"} 
        icon={Lightbulb} 
        colorClass="bg-amber-500" 
        groupKey="features"
        isOpen={openSections.features}
        onToggle={() => toggleSection('features')}
      >
        <TranslationSection
          title={isEnglish ? "Quick Tips" : "Conseils rapides"}
          sectionKey="quickTips"
          translations={currentTranslations}
          onTranslationChange={onTranslationChange}
          iconColor="text-amber-500"
          language={language}
        />
      </SectionGroup>
    </>
  );
}
