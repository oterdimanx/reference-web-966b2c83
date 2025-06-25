
import { supabase } from '@/integrations/supabase/client';
import { PricingPlan } from '@/types/addWebsiteForm';

export interface SubscriptionHistory {
  id: string;
  pricing_id: string;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  ended_at: string | null;
  pricing: {
    title: string;
    price: number;
  };
}

export const subscriptionService = {
  async upgradeSubscription(userId: string, newPricingPlan: PricingPlan) {
    try {
      // First, end the current active subscription
      const { error: endError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          ended_at: new Date().toISOString(),
          is_active: false
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (endError) {
        throw endError;
      }

      // Create new subscription
      const { data, error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          pricing_id: newPricingPlan.id,
          status: 'active',
          is_active: true,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('Subscription upgraded successfully');
      return data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },

  async getSubscriptionHistory(userId: string): Promise<SubscriptionHistory[]> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          pricing (
            title,
            price
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(sub => ({
        id: sub.id,
        pricing_id: sub.pricing_id,
        status: sub.status as 'active' | 'expired' | 'cancelled',
        started_at: sub.started_at,
        ended_at: sub.ended_at,
        pricing: {
          title: sub.pricing.title,
          price: sub.pricing.price
        }
      }));
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }
};
