
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserSubscription {
  id: string;
  user_id: string;
  pricing_id: string;
  pricing_title: string;
  pricing_price: number;
  websites_allowed: number;
  websites_used: number;
  is_active: boolean;
  status: string;
  created_at: string;
}

export const useUserSubscription = () => {
  const { user, isAdmin } = useAuth();
  
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user's current active subscription with pricing details
      const { data: subData, error: subError } = await supabase
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
        
      if (subError) {
        console.error('Error fetching subscription:', subError);
        throw subError;
      }
      
      // Count user's websites
      const { count: websiteCount, error: countError } = await supabase
        .from('websites')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (countError) {
        console.error('Error counting websites:', countError);
        throw countError;
      }
      
      if (!subData || !subData.pricing) {
        return {
          hasSubscription: false,
          websitesUsed: websiteCount || 0,
          websitesAllowed: 0,
          canAddWebsite: false,
          subscription: null
        };
      }
      
      // Calculate websites allowed based on pricing
      const websitesAllowed = subData.pricing.price === 1 ? 1 : 
                             subData.pricing.price < 10 ? 5 : 999;
      
      return {
        hasSubscription: true,
        websitesUsed: websiteCount || 0,
        websitesAllowed,
        canAddWebsite: isAdmin || (websiteCount || 0) < websitesAllowed,
        subscription: {
          ...subData,
          pricing_title: subData.pricing.title,
          pricing_price: subData.pricing.price,
          websites_allowed: websitesAllowed
        }
      };
    },
    enabled: !!user?.id
  });
  
  return {
    subscription,
    isLoading,
    hasSubscription: subscription?.hasSubscription || false,
    websitesUsed: subscription?.websitesUsed || 0,
    websitesAllowed: subscription?.websitesAllowed || 0,
    canAddWebsite: isAdmin || subscription?.canAddWebsite || false
  };
};
