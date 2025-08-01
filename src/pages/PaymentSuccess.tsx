import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useWebsiteSubmission } from '@/hooks/useWebsiteSubmission';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();
  const { submitWebsite } = useWebsiteSubmission();

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Check for upgrade flow
        const isUpgradeFlow = sessionStorage.getItem('isUpgradeFlow');
        const selectedPricing = sessionStorage.getItem('selectedPricing');
        
        // Get stored form data from sessionStorage
        const storedData = sessionStorage.getItem('websiteFormData');
        const storedImagePath = sessionStorage.getItem('websiteImagePath');
        const storedPricingPlans = sessionStorage.getItem('pricingPlans');
        
        console.log('PaymentSuccess: Processing payment with stored data:', {
          isUpgradeFlow: !!isUpgradeFlow,
          hasSelectedPricing: !!selectedPricing,
          hasStoredData: !!storedData,
          hasStoredImagePath: !!storedImagePath,
          hasStoredPricingPlans: !!storedPricingPlans,
          storedData: storedData ? JSON.parse(storedData) : null,
          actualValues: {
            isUpgradeFlow,
            selectedPricing,
            storedData
          }
        });
        
        // Handle subscription upgrade (without website submission)
        if (isUpgradeFlow && selectedPricing && !storedData) {
          const pricingData = JSON.parse(selectedPricing);
          console.log('PaymentSuccess: Processing subscription upgrade:', pricingData);
          
          if (user?.id) {
            // Cancel old subscription
            const { error: cancelError } = await supabase
              .from('user_subscriptions')
              .update({
                status: 'cancelled',
                ended_at: new Date().toISOString(),
                is_active: false
              })
              .eq('user_id', user.id)
              .eq('status', 'active');

            if (cancelError) {
              console.error('Error cancelling old subscription:', cancelError);
            }

            // Create new subscription
            const { error: createError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: user.id,
                pricing_id: pricingData.id,
                status: 'active',
                is_active: true,
                started_at: new Date().toISOString()
              });

            if (createError) {
              console.error('Error creating new subscription:', createError);
              throw createError;
            }

            console.log('PaymentSuccess: Subscription upgrade completed successfully');
          }
          
          // Clean up upgrade flow data
          sessionStorage.removeItem('isUpgradeFlow');
          sessionStorage.removeItem('selectedPricing');
          
          setIsComplete(true);
          toast.success('Subscription upgraded successfully!');
        }
        // Handle website submission with new subscription
        else if (storedData) {
          const formData = JSON.parse(storedData);
          const pricingPlans = storedPricingPlans ? JSON.parse(storedPricingPlans) : undefined;
          
          // Convert stored image path back to File if exists
          let imageFile = null;
          if (storedImagePath) {
            // In this case, we'll just pass null since the image was already processed
            // In a real implementation, you might want to store the image differently
          }
          
          console.log('PaymentSuccess: About to call submitWebsite');
          await submitWebsite(formData, pricingPlans, imageFile, true);
          console.log('PaymentSuccess: submitWebsite completed successfully');
          
          // Clean up stored data
          sessionStorage.removeItem('websiteFormData');
          sessionStorage.removeItem('websiteImagePath');
          sessionStorage.removeItem('pricingPlans');
          
          setIsComplete(true);
          toast.success('Website added successfully!');
        } else {
          console.log('PaymentSuccess: No stored data found in sessionStorage');
          toast.error('No data found. Please try again.');
          navigate('/');
        }
      } catch (error) {
        console.error('PaymentSuccess: Error processing payment success:', error);
        toast.error('Failed to process request. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure payment has been processed
    const timer = setTimeout(processPayment, 2000);
    return () => clearTimeout(timer);
  }, [submitWebsite, navigate, user?.id]);

  if (isProcessing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container max-w-2xl mx-auto px-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                  <h1 className="text-2xl font-bold">Processing your payment...</h1>
                  <p className="text-gray-600">
                    Please wait while we add your website to your account.
                  </p>
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
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
                <p className="text-gray-600">
                  Your payment has been processed successfully.
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-rank-teal hover:bg-rank-teal/90"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;