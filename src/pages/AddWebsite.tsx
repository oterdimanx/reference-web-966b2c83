
import { useState } from 'react';
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
import { PaymentStep } from '@/components/Payment/PaymentStep';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

const AddWebsite = () => {
  const { t } = useLanguage();
  const { form, isSubmitting, selectedImage, setSelectedImage, onSubmit } = useAddWebsiteForm();
  const [currentStep, setCurrentStep] = useState<'payment' | 'form'>('payment');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(29.99); // Default price
  
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
  
  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true);
    setTimeout(() => {
      setCurrentStep('form');
    }, 2000); // Show success message for 2 seconds, then proceed to form
  };

  const handlePaymentCancel = () => {
    // Redirect back to home page or show cancellation message
    window.history.back();
  };
  
  const handleSubmit = (data: any) => {
    onSubmit(data, pricingPlans);
  };
  
  if (currentStep === 'payment') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <PaymentStep
              amount={selectedPlanPrice}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={handlePaymentCancel}
              isPaymentComplete={isPaymentComplete}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Paiement confirmé
            </div>
            <h1 className="text-3xl font-bold">{t('addWebsiteForm', 'pageTitle')}</h1>
          </div>
          
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
