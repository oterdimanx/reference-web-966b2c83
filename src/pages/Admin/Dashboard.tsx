
import { useEffect, useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language, Translations } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminMenu from '@/components/Admin/AdminMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t, language, translations, updateTranslation } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [editedTranslations, setEditedTranslations] = useState<Partial<Translations>>({});
  
  // Initialize edited translations with current values
  useEffect(() => {
    setEditedTranslations({
      common: { ...translations.common },
      admin: { ...translations.admin },
      homepage: { ...translations.homepage },
      pages: { ...translations.pages }
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
  
  // Fetch summary data
  const { data: websitesCount } = useQuery({
    queryKey: ['admin', 'websites-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    enabled: !!user && isAdmin
  });
  
  const { data: usersCount } = useQuery({
    queryKey: ['admin', 'users-count'],
    queryFn: async () => {
      const { data } = await supabase.auth.admin.listUsers();
      return data?.users?.length || 0;
    },
    enabled: !!user && isAdmin
  });
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('admin', 'dashboard')}</h1>
        
        <AdminMenu />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin', 'totalUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : usersCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('admin', 'totalWebsites')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : websitesCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('admin', 'pricingPlans')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">2</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('admin', 'recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin', 'welcomeMessage')}</p>
          </CardContent>
        </Card>
        
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('admin', 'commonTexts')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.common || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.common?.[key as keyof typeof editedTranslations.common] || ''}
                          onChange={(e) => handleTranslationChange('common', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('admin', 'adminTexts')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.admin || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.admin?.[key as keyof typeof editedTranslations.admin] || ''}
                          onChange={(e) => handleTranslationChange('admin', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('admin', 'homepageTexts')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.homepage || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.homepage?.[key as keyof typeof editedTranslations.homepage] || ''}
                          onChange={(e) => handleTranslationChange('homepage', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Page Texts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.pages || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.pages?.[key as keyof typeof editedTranslations.pages] || ''}
                          onChange={(e) => handleTranslationChange('pages', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
              </TabsContent>
              
              <TabsContent value="fr" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Textes communs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.common || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.common?.[key as keyof typeof editedTranslations.common] || ''}
                          onChange={(e) => handleTranslationChange('common', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Textes administrateur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.admin || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.admin?.[key as keyof typeof editedTranslations.admin] || ''}
                          onChange={(e) => handleTranslationChange('admin', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Textes de la page d'accueil</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.homepage || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.homepage?.[key as keyof typeof editedTranslations.homepage] || ''}
                          onChange={(e) => handleTranslationChange('homepage', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Textes des pages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(editedTranslations.pages || {}).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">{key}</label>
                        <Input 
                          value={editedTranslations.pages?.[key as keyof typeof editedTranslations.pages] || ''}
                          onChange={(e) => handleTranslationChange('pages', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={saveTranslations} className="mt-4">{t('admin', 'saveTranslations')}</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
