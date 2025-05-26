
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useLanguage, Language, Translations } from '@/contexts/LanguageContext';
import { TranslationSection } from './TranslationSection';
import { ChevronDown, ChevronRight, Globe, Settings, Home, FileText, Scale, Lightbulb, Info } from 'lucide-react';

export function TranslationManager() {
  const { t, language, translations, updateTranslation } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [editedTranslations, setEditedTranslations] = useState<Partial<Translations>>({});
  
  // Collapsible states for each section group
  const [openSections, setOpenSections] = useState({
    core: true,
    pages: true,
    legal: true,
    features: true,
  });
  
  // Initialize edited translations with current values
  useEffect(() => {
    setEditedTranslations({
      common: { ...translations.common },
      admin: { ...translations.admin },
      homepage: { ...translations.homepage },
      pages: { ...translations.pages },
      aboutPage: { ...translations.aboutPage },
      allWebsitesPage: { ...translations.allWebsitesPage },
      addWebsiteForm: { ...translations.addWebsiteForm },
      legalPages: { ...translations.legalPages },
      quickTips: { ...translations.quickTips }
    });
  }, [language, translations]);
  
  // Handle translation text change
  const handleTranslationChange = (
    section: keyof Translations, 
    key: string, 
    value: string
  ) => {
    setEditedTranslations(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };
  
  // Save translations
  const saveTranslations = () => {
    // Update each changed translation
    Object.keys(editedTranslations).forEach((section) => {
      const sectionKey = section as keyof Translations;
      Object.keys(editedTranslations[sectionKey] || {}).forEach((key) => {
        const value = editedTranslations[sectionKey]?.[key as keyof typeof editedTranslations[typeof sectionKey]];
        if (value) {
          updateTranslation(sectionKey, key, value, selectedLanguage);
        }
      });
    });
    
    toast.success(`Translations for ${selectedLanguage.toUpperCase()} updated successfully`);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionGroup = ({ 
    title, 
    icon: Icon,
    colorClass = "bg-blue-500", 
    groupKey, 
    children 
  }: { 
    title: string;
    icon: React.ElementType;
    colorClass?: string; 
    groupKey: keyof typeof openSections; 
    children: React.ReactNode;
  }) => (
    <div className="mb-8">
      <Collapsible open={openSections[groupKey]} onOpenChange={() => toggleSection(groupKey)}>
        <div className={`flex items-center rounded-t-lg p-3 ${colorClass}`}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center w-full text-white font-semibold text-left">
              <Icon size={20} className="mr-2" />
              {title}
              {openSections[groupKey] ? (
                <ChevronDown className="ml-auto" size={20} />
              ) : (
                <ChevronRight className="ml-auto" size={20} />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-6">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t('admin', 'translationManager')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="en" onValueChange={(val) => setSelectedLanguage(val as Language)}>
          <TabsList className="mb-4">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
          </TabsList>
          
          <TabsContent value="en" className="space-y-6">
            <SectionGroup title="Core Application Texts" icon={Globe} colorClass="bg-blue-600" groupKey="core">
              <TranslationSection
                title="Common Texts"
                sectionKey="common"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
              
              <TranslationSection
                title="Admin Texts"
                sectionKey="admin"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
              
              <TranslationSection
                title="Homepage Texts"
                sectionKey="homepage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
            </SectionGroup>
            
            <SectionGroup title="Feature Pages" icon={FileText} colorClass="bg-purple-600" groupKey="pages">
              <TranslationSection
                title="General Page Texts"
                sectionKey="pages"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="About Page"
                sectionKey="aboutPage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="All Websites Page"
                sectionKey="allWebsitesPage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="Add Website Form"
                sectionKey="addWebsiteForm"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
            </SectionGroup>

            <SectionGroup title="Legal Pages" icon={Scale} colorClass="bg-gray-700" groupKey="legal">
              <TranslationSection
                title="Privacy Policy & Terms of Service"
                sectionKey="legalPages"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-gray-700"
              />
            </SectionGroup>
            
            <SectionGroup title="Features & Components" icon={Lightbulb} colorClass="bg-amber-500" groupKey="features">
              <TranslationSection
                title="Quick Tips"
                sectionKey="quickTips"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-amber-500"
              />
            </SectionGroup>
            
            <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
          </TabsContent>
          
          <TabsContent value="fr" className="space-y-6">
            <SectionGroup title="Textes de l'application principale" icon={Globe} colorClass="bg-blue-600" groupKey="core">
              <TranslationSection
                title="Textes communs"
                sectionKey="common"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
              
              <TranslationSection
                title="Textes administrateur"
                sectionKey="admin"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
              
              <TranslationSection
                title="Textes de la page d'accueil"
                sectionKey="homepage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
              />
            </SectionGroup>
            
            <SectionGroup title="Pages de fonctionnalités" icon={FileText} colorClass="bg-purple-600" groupKey="pages">
              <TranslationSection
                title="Textes des pages généraux"
                sectionKey="pages"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="Page À propos"
                sectionKey="aboutPage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="Page Tous les sites web"
                sectionKey="allWebsitesPage"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
              
              <TranslationSection
                title="Formulaire d'ajout de site web"
                sectionKey="addWebsiteForm"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
              />
            </SectionGroup>

            <SectionGroup title="Pages légales" icon={Scale} colorClass="bg-gray-700" groupKey="legal">
              <TranslationSection
                title="Politique de confidentialité & Conditions d'utilisation"
                sectionKey="legalPages"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-gray-700"
              />
            </SectionGroup>
            
            <SectionGroup title="Fonctionnalités & Composants" icon={Lightbulb} colorClass="bg-amber-500" groupKey="features">
              <TranslationSection
                title="Conseils rapides"
                sectionKey="quickTips"
                translations={editedTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-amber-500"
              />
            </SectionGroup>
            
            <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
