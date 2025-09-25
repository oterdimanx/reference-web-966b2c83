
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
interface PricingPlan {
  id: string;
  title: string;
  price: number;
  active: boolean;
  description_en?: string;
  description_fr?: string;
  title_fr?: string;
  frequency_en?: string;
  frequency_fr?: string;
}

export const SubscriptionUpgrade = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Fetch current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          pricing (
            title,
            price
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch available pricing plans
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

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user?.id) return;
    
    setUpgrading(plan.id);
    try {
      // Redirect to payment process instead of direct upgrade
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan.id,
          userId: user.id,
          isUpgrade: true
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting upgrade process:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setUpgrading(null);
    }
  };

  const getWebsitesAllowed = (price: number) => {
    if (price === 1) return 1;
    if (price < 10) return 5;
    return 999;
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
        t('pricing', 'feature1Website'),
        t('pricing', 'featureKeywordTracking'),
        t('pricing', 'featureAnalyticsDashboard'),
      ];
    }
    
    return [
      `${getWebsitesAllowed(plan.price) === 999 
        ? t('pricing', 'featureUnlimitedWebsites')
        : `${getWebsitesAllowed(plan.price)} ${t('pricing', 'featureWebsites')}`
      }`,
      t('pricing', 'featureKeywordTracking'),
      t('pricing', 'featureAnalyticsDashboard'),
    ];
  };

  const getPlanTitle = (plan: PricingPlan) => {
    return language === 'fr' && plan.title_fr ? plan.title_fr : plan.title;
  };

  const getPaymentFrequency = (plan: PricingPlan) => {
    // Use database frequency values if available
    const frequency = language === 'fr' && plan.frequency_fr ? plan.frequency_fr : plan.frequency_en;
    if (frequency) {
      return frequency;
    }
    
    // Fallback to original logic if no database values
    if (plan.price === 1) {
      return t('pricingPage', 'oneTime');
    } else if (plan.price < 10) { // Basic plans are under €10
      return language === 'fr' ? '/3 mois' : '/3 months';
    } else { // Premium plans are €10 and above
      return language === 'fr' ? '/an' : '/year';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!pricingPlans || pricingPlans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {t('pricing', 'noPricingPlans')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{t('pricingPage', 'choosePlan')}</h3>
        <p className="text-muted-foreground">
          {t('pricingPage', 'subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {pricingPlans.map((plan) => {
          const websitesAllowed = getWebsitesAllowed(plan.price);
          const isCurrentPlan = currentSubscription?.pricing_id === plan.id;
          const isDowngrade = currentSubscription && plan.price < currentSubscription.pricing.price;
          
          return (
            <Card key={plan.id} className={isCurrentPlan ? 'chrome-card-subtle card-hover h-full' : ''}>
              
              {isCurrentPlan && (
                <Badge variant="default" className="metallic-badge absolute -top-3 left-1/2 transform -translate-x-1/2 z-[200]">{language === 'fr' ? 'Plan Actuel' : 'Current Plan'}</Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl gradient-text">{getPlanTitle(plan)}</CardTitle>
                </div>
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
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan || isDowngrade || upgrading === plan.id}
                  className="w-full chrome-accent"
                  variant={isCurrentPlan ? "secondary" : "default"}
                >
                  {upgrading === plan.id 
                    ? (language === 'fr' ? 'Redirection vers le paiement...' : 'Redirecting to payment...')
                    : isCurrentPlan 
                      ? (language === 'fr' ? 'Plan Actuel' : 'Current Plan')
                      : isDowngrade 
                        ? (language === 'fr' ? 'Rétrogradation non disponible' : 'Downgrade not available')
                        : (language === 'fr' ? `Passer à €${plan.price}${getPaymentFrequency(plan)}` : `Upgrade for €${plan.price}${getPaymentFrequency(plan)}`)
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
