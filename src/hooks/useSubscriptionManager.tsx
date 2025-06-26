
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PricingPlan } from '@/types/addWebsiteForm';

export const useSubscriptionManager = () => {
  const { user } = useAuth();

  const saveUserSubscription = async (pricingPlan: PricingPlan) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }
      
      // Check if user already has an active subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
        
      if (existingSub) {
        // If user has a subscription, redirect to payment for upgrade
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: pricingPlan.id,
            userId: user.id,
            isUpgrade: true
          }
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error('No checkout URL received for upgrade');
        }
      } else {
        // Create new subscription - this should also go through payment
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: pricingPlan.id,
            userId: user.id,
            isUpgrade: false
          }
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      }
    } catch (error) {
      console.error('Error managing user subscription:', error);
      throw error;
    }
  };

  const upgradeSubscription = async (newPricingPlan: PricingPlan) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }
      
      // Redirect to payment for upgrade instead of direct upgrade
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: newPricingPlan.id,
          userId: user.id,
          isUpgrade: true
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received for upgrade');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  };

  return { saveUserSubscription, upgradeSubscription };
};
