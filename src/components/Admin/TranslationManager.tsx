
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { TranslationTabs } from './TranslationTabs';

export function TranslationManager() {
  const { t, updateTranslation, isSaving, isLoading } = useLanguage();
  const { buildTranslations } = useCustomTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  
  // Get translations for the currently selected language in the admin panel
  const currentTranslations = buildTranslations(selectedLanguage);
  
  // Collapsible states for each section group
  const [openSections, setOpenSections] = useState({
    core: false,
    pages: false,
    legal: false,
    features: false,
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
            <TranslationTabs
              language={selectedLanguage}
              currentTranslations={currentTranslations}
              onTranslationChange={handleTranslationChange}
              openSections={openSections}
              toggleSection={toggleSection}
            />
          </TabsContent>
          
          <TabsContent value="fr" className="space-y-6">
            <TranslationTabs
              language={selectedLanguage}
              currentTranslations={currentTranslations}
              onTranslationChange={handleTranslationChange}
              openSections={openSections}
              toggleSection={toggleSection}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
