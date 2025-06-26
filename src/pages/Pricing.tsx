import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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
  description_en?: string;
  description_fr?: string;
  title_fr?: string;
}

const Pricing = () => {
  const { t, language } = useLanguage();
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

  const getFeatures = (plan: PricingPlan) => {
    // Get the appropriate description based on language
    const description = language === 'fr' && plan.description_fr ? plan.description_fr : plan.description_en;
    
    // If we have a description from the database, use it
    if (description) {
      return description.split('|');
    }
    
    // Fallback to the original logic if no description in database
    if (plan.price === 1) {
      return [
        'Add 1 website to track',
        'Basic keyword tracking',
        'Essential ranking data',
        'Email support'
      ];
    }
    
    return [
      `Add up to ${plan.price === 1 ? '1' : plan.price < 10 ? '5' : 'unlimited'} websites`,
      'Advanced keyword tracking',
      'Detailed analytics',
      'Priority support',
      'Custom reports'
    ];
  };

  const getPlanTitle = (plan: PricingPlan) => {
    return language === 'fr' && plan.title_fr ? plan.title_fr : plan.title;
  };

  const getPaymentFrequency = (plan: PricingPlan) => {
    // €1 plan shows "one-time", basic plan shows "/3 months", premium shows "/year"
    if (plan.price === 1) {
      return t('pricingPage', 'oneTime');
    } else if (plan.price < 10) { // Basic plans are under €10
      return language === 'fr' ? '/3 mois' : '/3 months';
    } else { // Premium plans are €10 and above
      return language === 'fr' ? '/an' : '/year';
    }
  };

  const getPlanDescription = (plan: PricingPlan) => {
    return language === 'fr' && plan.description_fr ? plan.description_fr : plan.description_en;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              <span className="text-rank-teal">{t('pricingPage', 'choosePlan')}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('pricingPage', 'subtitle')}
            </p>
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
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="chrome-card">
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
              <Card className="max-w-md mx-auto chrome-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('pricing', 'noPricingPlans')}</h3>
                    <p className="text-muted-foreground">{t('pricing', 'contactSupport')}</p>
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
                    <Card key={plan.id} className={`chrome-card card-hover relative ${isPopular ? 'border-primary shadow-lg scale-105 pulse-glow' : ''}`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="chrome-accent px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            {t('pricing', 'mostPopular')}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl gradient-text">{getPlanTitle(plan)}</CardTitle>
                        <CardDescription>
                          <span className="text-4xl font-bold text-rank-teal gradient-text">€{plan.price}</span>
                          <span className="text-gray-500 ml-2">{getPaymentFrequency(plan)}</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <ul className="space-y-3">
                          {getFeatures(plan).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-5 w-5 text-rank-teal mr-3" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/*<Button 
                          onClick={() => handleSelectPlan(plan)}
                          disabled={selectedPlan === plan.id}
                          className={`w-full chrome-button ${isPopular ? 'chrome-accent' : ''}`}
                          size="lg"
                        >*/}
                          {selectedPlan === plan.id ? 'Processing...' : t('pricing', 'getStarted')}
                        </Button>
                      </CardContent>
                      <CardFooter>
                        {user ? (
                          <Button 
                            asChild 
                            className={`w-full chrome-button ${isPopular ? 'chrome-accent' : ''}`}
                            disabled={selectedPlan === plan.id}
                            size="lg"
                          >
                            <Link to={`/add-website?plan=${plan.id}`}>{t('pricingPage', 'getStarted')}</Link>
                          </Button>
                        ) : (
                          <Button 
                            asChild 
                            className={`w-full chrome-button-subtle ${
                              plan.price === 1 
                                ? 'chrome-accent-subtle text-white' 
                                : 'chrome-button-subtle'
                            }`}
                          >
                            <Link to="/auth">{t('pricingPage', 'signUpTo')} {t('pricingPage', 'getStarted')}</Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
