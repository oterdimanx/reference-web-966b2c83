
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
            <Card key={plan.id} className={isCurrentPlan ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{getPlanTitle(plan)}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default">{language === 'fr' ? 'Plan Actuel' : 'Current Plan'}</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">{getPaymentFrequency(plan)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="text-sm">
                      {websitesAllowed === 999 
                        ? (language === 'fr' ? 'Illimité' : 'Unlimited')
                        : websitesAllowed
                      } {language === 'fr' ? 'site' : 'website'}{websitesAllowed !== 1 ? (language === 'fr' ? 's' : 's') : ''}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-sm">{language === 'fr' ? 'Suivi des mots-clés' : 'Keyword tracking'}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-sm">{language === 'fr' ? 'Tableau de bord analytique' : 'Analytics dashboard'}</span>
                  </li>
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan || isDowngrade || upgrading === plan.id}
                  className="w-full"
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
