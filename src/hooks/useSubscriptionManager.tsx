
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
      
      // Check if user already has an active subscription for this plan
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('pricing_id', pricingPlan.id)
        .eq('is_active', true)
        .maybeSingle();
        
      if (existingSub) {
        console.log('User already has active subscription for this plan');
        return;
      }
      
      // Create new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          pricing_id: pricingPlan.id,
          is_active: true
        });
        
      if (error) {
        throw error;
      }
      
      console.log('User subscription saved successfully');
    } catch (error) {
      console.error('Error saving user subscription:', error);
      throw error;
    }
  };

  return { saveUserSubscription };
};
