
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Define the pricing plan type
export interface PricingPlan {
  id: string;
  title: string;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Form schema
export const pricingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price must be 0 or higher"),
  active: z.boolean().default(true)
});

export type PricingFormValues = z.infer<typeof pricingFormSchema>;

export const usePricingPlans = (userId: string | undefined, isAdmin: boolean) => {
  const queryClient = useQueryClient();
  
  // Fetch pricing plans
  const { 
    data: pricingPlans, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['pricing-plans', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data as PricingPlan[];
    },
    enabled: !!userId && isAdmin
  });
  
  // Create pricing plan mutation
  const createPricingMutation = useMutation({
    mutationFn: async (values: PricingFormValues) => {
      const { data, error } = await supabase
        .from('pricing')
        .insert({
          title: values.title,
          price: values.price,
          active: values.active
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast.success("Pricing plan created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create pricing plan: ${error.message}`);
    }
  });
  
  // Update pricing plan mutation
  const updatePricingMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: PricingFormValues }) => {
      const { data, error } = await supabase
        .from('pricing')
        .update({
          title: values.title,
          price: values.price,
          active: values.active
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast.success("Pricing plan updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update pricing plan: ${error.message}`);
    }
  });
  
  // Delete pricing plan mutation
  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast.success("Pricing plan deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete pricing plan: ${error.message}`);
    }
  });

  return {
    pricingPlans,
    isLoading,
    error,
    createPricingMutation,
    updatePricingMutation,
    deletePricingMutation
  };
};
