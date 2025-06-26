
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Star } from 'lucide-react';
import { useSubscriptionManager } from '@/hooks/useSubscriptionManager';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { SubscriptionUpgrade } from '@/components/Pricing/SubscriptionUpgrade';
import { toast } from 'sonner';
import { useState } from 'react';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
  active: boolean;
}

const PricingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { saveUserSubscription } = useSubscriptionManager();
  const { hasSubscription } = useUserSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: pricingPlans, isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data as PricingPlan[];
    }
  });

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
      return;
    }

    setSelectedPlan(plan.id);
    try {
      await saveUserSubscription(plan);
      toast.success(`Successfully subscribed to ${plan.title}!`);
      // Redirect to add website page
      window.location.href = '/add-website';
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan');
    } finally {
      setSelectedPlan(null);
    }
  };

  const getWebsitesAllowed = (price: number) => {
    if (price === 1) return 1;
    if (price < 10) return 5;
    return 999;
  };

  const getMostPopularPlan = () => {
    if (!pricingPlans || pricingPlans.length === 0) return null;
    // Return the middle plan or the one with price around 5-10
    return pricingPlans.find(plan => plan.price >= 5 && plan.price <= 10) || pricingPlans[1];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('pricingPage', 'title')}</h1>
          <p className="text-xl text-muted-foreground mb-6">{t('pricingPage', 'subtitle')}</p>
          
          <div className="text-center mb-8">
            <p className="text-lg mb-2">{t('pricingPage', 'startMessage')}</p>
            <span className="text-3xl font-bold text-primary">{t('pricingPage', 'startAmount')}</span>
          </div>
        </div>

        {/* Show upgrade section for existing users */}
        {user && hasSubscription && (
          <div className="mb-12">
            <SubscriptionUpgrade />
          </div>
        )}

        {/* Show regular pricing for new users or users without subscription */}
        {(!user || !hasSubscription) && (
          <>
            <h2 className="text-2xl font-bold text-center mb-8">{t('pricingPage', 'choosePlan')}</h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !pricingPlans || pricingPlans.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('pricingPage', 'noPricingPlans')}</h3>
                    <p className="text-muted-foreground">{t('pricingPage', 'contactSupport')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {pricingPlans.map((plan) => {
                  const websitesAllowed = getWebsitesAllowed(plan.price);
                  const mostPopular = getMostPopularPlan();
                  const isPopular = mostPopular?.id === plan.id;
                  
                  return (
                    <Card key={plan.id} className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            {t('pricingPage', 'mostPopular')}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{plan.title}</CardTitle>
                        <CardDescription>
                          <span className="text-3xl font-bold">€{plan.price}</span>
                          <span className="text-muted-foreground">{t('pricingPage', 'monthly')}</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">
                              {websitesAllowed === 999 ? 'Unlimited' : websitesAllowed} website{websitesAllowed !== 1 ? 's' : ''}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Keyword tracking</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Analytics dashboard</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">24/7 Support</span>
                          </li>
                        </ul>
                        
                        <Button 
                          onClick={() => handleSelectPlan(plan)}
                          disabled={selectedPlan === plan.id}
                          className="w-full"
                          size="lg"
                          variant={isPopular ? "default" : "outline"}
                        >
                          {selectedPlan === plan.id ? 'Processing...' : t('pricingPage', 'getStarted')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
