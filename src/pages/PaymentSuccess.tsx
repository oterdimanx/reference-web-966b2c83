import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useWebsiteSubmission } from '@/hooks/useWebsiteSubmission';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const { submitWebsite } = useWebsiteSubmission();

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get stored form data from sessionStorage
        const storedData = sessionStorage.getItem('websiteFormData');
        const storedImagePath = sessionStorage.getItem('websiteImagePath');
        const storedPricingPlans = sessionStorage.getItem('pricingPlans');
        
        console.log('PaymentSuccess: Processing payment with stored data:', {
          hasStoredData: !!storedData,
          hasStoredImagePath: !!storedImagePath,
          hasStoredPricingPlans: !!storedPricingPlans,
          storedData: storedData ? JSON.parse(storedData) : null
        });
        
        if (storedData) {
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
          toast.error('No website data found. Please try adding your website again.');
          navigate('/add-website');
        }
      } catch (error) {
        console.error('PaymentSuccess: Error processing payment success:', error);
        toast.error('Failed to add website. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure payment has been processed
    const timer = setTimeout(processPayment, 2000);
    return () => clearTimeout(timer);
  }, [submitWebsite, navigate]);

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
                  Your payment has been processed and your website has been added to your account.
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