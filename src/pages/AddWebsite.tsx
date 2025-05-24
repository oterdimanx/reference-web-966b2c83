
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAddWebsiteForm } from '@/hooks/useAddWebsiteForm';
import { WebsiteBasicInfo } from '@/components/AddWebsite/WebsiteBasicInfo';
import { ContactInfo } from '@/components/AddWebsite/ContactInfo';
import { AdditionalSettings } from '@/components/AddWebsite/AdditionalSettings';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

const AddWebsite = () => {
  const { t } = useLanguage();
  const { form, isSubmitting, selectedImage, setSelectedImage, onSubmit } = useAddWebsiteForm();
  
  // Fetch pricing plans
  const { data: pricingPlans, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('id, title, price')
        .eq('active', true)
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data as PricingPlan[];
    }
  });
  
  const handleSubmit = (data: any) => {
    onSubmit(data, pricingPlans);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">{t('addWebsiteForm', 'pageTitle')}</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('addWebsiteForm', 'websiteDetails')}</CardTitle>
              <CardDescription>
                {t('addWebsiteForm', 'websiteDetailsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <WebsiteBasicInfo form={form} onImageSelect={setSelectedImage} />
                  <ContactInfo form={form} />
                  <AdditionalSettings 
                    form={form} 
                    pricingPlans={pricingPlans} 
                    pricingLoading={pricingLoading} 
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-rank-teal hover:bg-rank-teal/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('addWebsiteForm', 'addingWebsite') : t('addWebsiteForm', 'addWebsiteButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddWebsite;
