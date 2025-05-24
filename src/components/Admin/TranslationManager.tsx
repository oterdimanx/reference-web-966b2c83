
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage, Language, Translations } from '@/contexts/LanguageContext';
import { TranslationSection } from './TranslationSection';

export function TranslationManager() {
  const { t, language, translations, updateTranslation } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [editedTranslations, setEditedTranslations] = useState<Partial<Translations>>({});
  
  // Initialize edited translations with current values
  useEffect(() => {
    setEditedTranslations({
      common: { ...translations.common },
      admin: { ...translations.admin },
      homepage: { ...translations.homepage },
      pages: { ...translations.pages },
      aboutPage: { ...translations.aboutPage },
      allWebsitesPage: { ...translations.allWebsitesPage },
      addWebsiteForm: { ...translations.addWebsiteForm }
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

  return (
    <Card>
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
            <TranslationSection
              title={t('admin', 'commonTexts')}
              sectionKey="common"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title={t('admin', 'adminTexts')}
              sectionKey="admin"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title={t('admin', 'homepageTexts')}
              sectionKey="homepage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Page Texts"
              sectionKey="pages"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="About Page"
              sectionKey="aboutPage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="All Websites Page"
              sectionKey="allWebsitesPage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Add Website Form"
              sectionKey="addWebsiteForm"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
          </TabsContent>
          
          <TabsContent value="fr" className="space-y-6">
            <TranslationSection
              title="Textes communs"
              sectionKey="common"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Textes administrateur"
              sectionKey="admin"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Textes de la page d'accueil"
              sectionKey="homepage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Textes des pages"
              sectionKey="pages"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Page À propos"
              sectionKey="aboutPage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Page Tous les sites web"
              sectionKey="allWebsitesPage"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <TranslationSection
              title="Formulaire d'ajout de site web"
              sectionKey="addWebsiteForm"
              translations={editedTranslations}
              onTranslationChange={handleTranslationChange}
            />
            
            <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
