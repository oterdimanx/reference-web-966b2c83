
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PricingPlan } from '@/types/addWebsiteForm';
import { subscriptionService } from '@/services/subscriptionService';

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
        // If user has a subscription, upgrade it
        await subscriptionService.upgradeSubscription(user.id, pricingPlan);
        console.log('User subscription upgraded successfully');
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            pricing_id: pricingPlan.id,
            status: 'active',
            is_active: true,
            started_at: new Date().toISOString()
          });
          
        if (error) {
          throw error;
        }
        
        console.log('User subscription created successfully');
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
      
      await subscriptionService.upgradeSubscription(user.id, newPricingPlan);
      console.log('Subscription upgraded successfully');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  };

  return { saveUserSubscription, upgradeSubscription };
};
