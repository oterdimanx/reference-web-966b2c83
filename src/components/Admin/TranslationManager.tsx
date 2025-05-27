
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { TranslationSection } from './TranslationSection';
import { ChevronDown, ChevronRight, Globe, FileText, Scale, Lightbulb } from 'lucide-react';

export function TranslationManager() {
  const { t, updateTranslation, isSaving, isLoading } = useLanguage();
  const { buildTranslations } = useCustomTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  
  // Get translations for the currently selected language in the admin panel
  const currentTranslations = buildTranslations(selectedLanguage);
  
  // Collapsible states for each section group
  const [openSections, setOpenSections] = useState({
    core: true,
    pages: true,
    legal: true,
    features: true,
  });
  
  // Handle translation text change
  const handleTranslationChange = async (
    section: keyof typeof currentTranslations, 
    key: string, 
    value: string
  ) => {
    try {
      await updateTranslation(section, key, value, selectedLanguage);
      toast.success(`${selectedLanguage.toUpperCase()} translation updated successfully`);
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Failed to save translation');
    }
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

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('admin', 'translationManager')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading translations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t('admin', 'translationManager')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Currently editing: <strong>{selectedLanguage === 'en' ? 'English' : 'French'}</strong> translations
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
          <TabsList className="mb-4">
            <TabsTrigger value="en">Edit English</TabsTrigger>
            <TabsTrigger value="fr">Edit French</TabsTrigger>
          </TabsList>
          
          <TabsContent value="en" className="space-y-6">
            <SectionGroup title="Core Application Texts" icon={Globe} colorClass="bg-blue-600" groupKey="core">
              <TranslationSection
                title="Common Texts"
                sectionKey="common"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Admin Texts"
                sectionKey="admin"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Homepage Texts"
                sectionKey="homepage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
            </SectionGroup>
            
            <SectionGroup title="Feature Pages" icon={FileText} colorClass="bg-purple-600" groupKey="pages">
              <TranslationSection
                title="General Page Texts"
                sectionKey="pages"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Directory Page"
                sectionKey="directoryPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="About Page"
                sectionKey="aboutPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="All Websites Page"
                sectionKey="allWebsitesPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Add Website Form"
                sectionKey="addWebsiteForm"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Pricing Page"
                sectionKey="pricingPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
            </SectionGroup>

            <SectionGroup title="Legal Pages" icon={Scale} colorClass="bg-gray-700" groupKey="legal">
              <TranslationSection
                title="Privacy Policy & Terms of Service"
                sectionKey="legalPages"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-gray-700"
                language={selectedLanguage}
              />
            </SectionGroup>
            
            <SectionGroup title="Features & Components" icon={Lightbulb} colorClass="bg-amber-500" groupKey="features">
              <TranslationSection
                title="Quick Tips"
                sectionKey="quickTips"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-amber-500"
                language={selectedLanguage}
              />
            </SectionGroup>
          </TabsContent>
          
          <TabsContent value="fr" className="space-y-6">
            <SectionGroup title="Textes de l'application principale" icon={Globe} colorClass="bg-blue-600" groupKey="core">
              <TranslationSection
                title="Textes communs"
                sectionKey="common"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Textes administrateur"
                sectionKey="admin"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Textes de la page d'accueil"
                sectionKey="homepage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-blue-600"
                language={selectedLanguage}
              />
            </SectionGroup>
            
            <SectionGroup title="Pages de fonctionnalités" icon={FileText} colorClass="bg-purple-600" groupKey="pages">
              <TranslationSection
                title="Textes des pages généraux"
                sectionKey="pages"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Page Répertoire"
                sectionKey="directoryPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Page À propos"
                sectionKey="aboutPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Page Tous les sites web"
                sectionKey="allWebsitesPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Formulaire d'ajout de site web"
                sectionKey="addWebsiteForm"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
              
              <TranslationSection
                title="Page de tarification"
                sectionKey="pricingPage"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-purple-600"
                language={selectedLanguage}
              />
            </SectionGroup>

            <SectionGroup title="Pages légales" icon={Scale} colorClass="bg-gray-700" groupKey="legal">
              <TranslationSection
                title="Politique de confidentialité & Conditions d'utilisation"
                sectionKey="legalPages"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-gray-700"
                language={selectedLanguage}
              />
            </SectionGroup>
            
            <SectionGroup title="Fonctionnalités & Composants" icon={Lightbulb} colorClass="bg-amber-500" groupKey="features">
              <TranslationSection
                title="Conseils rapides"
                sectionKey="quickTips"
                translations={currentTranslations}
                onTranslationChange={handleTranslationChange}
                iconColor="text-amber-500"
                language={selectedLanguage}
              />
            </SectionGroup>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
