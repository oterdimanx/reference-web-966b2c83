
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface PricingPlan {
  id: string;
  title: string;
  title_fr: string | null;
  description_fr: string | null;
  description_en: string | null;
  price: number;
  active: boolean;
}

const Pricing = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const { data: pricingPlans, isLoading } = useQuery({
    queryKey: ['pricing-plans-public'],
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t('pricingPage', 'title')} <span className="text-rank-teal">{t('pricingPage', 'choosePlan')}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('pricingPage', 'subtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center">{t('pricingPage', 'loadingPlans')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pricingPlans?.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.price === 1 ? 'border-rank-teal border-2 shadow-lg' : ''}`}
                >
                  {plan.price === 1 && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rank-teal">
                      {t('pricingPage', 'mostPopular')}
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{getPlanTitle(plan)}</CardTitle>
                    <CardDescription>
                      <span className="text-4xl font-bold text-rank-teal">€{plan.price}</span>
                      <span className="text-gray-500 ml-2">{t('pricingPage', 'oneTime')}</span>
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
                  </CardContent>
                  
                  <CardFooter>
                    {user ? (
                      <Button 
                        asChild 
                        className={`w-full ${
                          plan.price === 1 
                            ? 'bg-rank-teal hover:bg-rank-teal/90' 
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        <Link to={`/add-website?plan=${plan.id}`}>{t('pricingPage', 'getStarted')}</Link>
                      </Button>
                    ) : (
                      <Button 
                        asChild 
                        className={`w-full ${
                          plan.price === 1 
                            ? 'bg-rank-teal hover:bg-rank-teal/90' 
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        <Link to="/auth">{t('pricingPage', 'signUpTo')} {t('pricingPage', 'getStarted')}</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
                {t('pricingPage', 'startMessage')} {t('pricingPage', 'startAmount')}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-6">
                {t('pricingPage', 'startDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-rank-teal hover:bg-rank-teal/90">
                  <Link to={user ? "/add-website" : "/auth"}>
                    {user ? t('pricingPage', 'addFirstWebsite') : t('pricingPage', 'signUpStart')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/about">{t('pricingPage', 'learnMore')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
