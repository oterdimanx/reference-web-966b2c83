
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { pricingFormSchema, PricingFormValues, PricingPlan, usePricingPlans } from '@/hooks/use-pricing-plans';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PricingPlanEditDialogProps {
  plan: PricingPlan;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingPlanEditDialog = ({ plan, isOpen, onOpenChange }: PricingPlanEditDialogProps) => {
  const { user } = useAuth();
  const { updatePricingMutation } = usePricingPlans(user?.id, true);
  
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      title: plan.title,
      price: plan.price,
      frequency_en: plan.frequency_en || "",
      frequency_fr: plan.frequency_fr || "",
      active: plan.active
    }
  });

  // Reset form when plan changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: plan.title,
        price: plan.price,
        frequency_en: plan.frequency_en || "",
        frequency_fr: plan.frequency_fr || "",
        active: plan.active
      });
    }
  }, [form, plan, isOpen]);

  const onSubmit = (values: PricingFormValues) => {
    updatePricingMutation.mutate(
      { id: plan.id, values }, 
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pricing Plan</DialogTitle>
          <DialogDescription>
            Update the details of this pricing plan.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Plan" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of this pricing plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Monthly price in USD
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Frequency (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., /month, /year" {...field} />
                  </FormControl>
                  <FormDescription>
                    Payment frequency displayed in English
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Frequency (French)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., /mois, /an" {...field} />
                  </FormControl>
                  <FormDescription>
                    Payment frequency displayed in French
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Make this plan visible to users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updatePricingMutation.isPending}>
                {updatePricingMutation.isPending ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingPlanEditDialog;
