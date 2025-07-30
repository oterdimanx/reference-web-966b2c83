import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAddWebsiteForm } from '@/hooks/useAddWebsiteForm';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useWebsiteSubmission } from '@/hooks/useWebsiteSubmission';
import { useAuth } from '@/contexts/AuthContext';
import { WebsiteBasicInfo } from '@/components/AddWebsite/WebsiteBasicInfo';
import { ContactInfo } from '@/components/AddWebsite/ContactInfo';
import { AdditionalSettings } from '@/components/AddWebsite/AdditionalSettings';
import { PaymentStep } from '@/components/Payment/PaymentStep';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

const AddWebsite = () => {
  const { t } = useLanguage();
  const { subscription, isLoading: subscriptionLoading, canAddWebsite, websitesUsed, websitesAllowed } = useUserSubscription();
  const { isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [validatedFormData, setValidatedFormData] = useState<any>(null);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(29.99);
  const [storedSelectedImage, setStoredSelectedImage] = useState<File | null>(null);
  
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
  
  const { form, isSubmitting, selectedImage, setSelectedImage, onSubmit } = useAddWebsiteForm(pricingPlans);
  const { submitWebsite } = useWebsiteSubmission();
  
  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show subscription limit reached message (but not for admins)
  if (!isAdmin && !canAddWebsite && subscription?.hasSubscription) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Website limit reached!</strong>
                <br />
                You have used {websitesUsed} out of {websitesAllowed} websites allowed with your current plan.
                <br />
                <Link to="/pricing" className="underline font-medium">
                  Upgrade your plan to add more websites
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleFormSubmit = (data: any) => {
    // Store form data and selected image, then proceed to payment
    setValidatedFormData(data);
    setStoredSelectedImage(selectedImage);
    
    // Find selected plan price
    const selectedPlan = pricingPlans?.find(plan => plan.id === data.pricing_id);
    if (selectedPlan) {
      setSelectedPlanPrice(selectedPlan.price);
    }
    
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentComplete(true);
    
    // Now actually submit the data to database with the stored image
    if (validatedFormData) {
      try {
        await submitWebsite(validatedFormData, pricingPlans, storedSelectedImage);
      } catch (error) {
        console.error('Error submitting website after payment:', error);
        // Don't show success page if submission fails
        return;
      }
    }
    
    setTimeout(() => {
      setCurrentStep('success');
    }, 2000);
  };

  const handlePaymentCancel = () => {
    // Go back to form
    setCurrentStep('form');
  };
  
  if (currentStep === 'payment') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('form')}
                className="mb-4"
              >
                ← Retour au formulaire
              </Button>
              <h1 className="text-3xl font-bold">Finaliser votre commande</h1>
              <p className="text-gray-600 mt-2">
                Formulaire validé ! Procédez maintenant au paiement pour ajouter votre site web.
              </p>
            </div>
            
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

  if (currentStep === 'success') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h1 className="text-3xl font-bold text-green-700">Site web ajouté avec succès !</h1>
                  <p className="text-gray-600">
                    Votre site web a été ajouté et le paiement a été traité avec succès.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-rank-teal hover:bg-rank-teal/90"
                  >
                    Retour au tableau de bord
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <h1 className="text-3xl font-bold">{t('addWebsiteForm', 'pageTitle')}</h1>
            <p className="text-gray-600 mt-2">
              Remplissez les informations de votre site web. Le paiement sera demandé après validation du formulaire.
            </p>
            
            {subscription?.hasSubscription && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current plan:</strong> {subscription.subscription?.pricing_title} 
                  <br />
                  <strong>Websites:</strong> {websitesUsed} / {websitesAllowed} used
                </p>
              </div>
            )}
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
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <WebsiteBasicInfo form={form} onImageSelect={setSelectedImage} />
                  <ContactInfo form={form} />
                  <AdditionalSettings 
                    form={form} 
                    pricingPlans={pricingPlans} 
                    pricingLoading={pricingLoading} 
                  />
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Étape suivante : Paiement</h4>
                    <p className="text-sm text-blue-700">
                      Après validation de ce formulaire, vous serez dirigé vers la page de paiement sécurisé.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-rank-teal hover:bg-rank-teal/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Validation..." : "Valider et procéder au paiement"}
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
