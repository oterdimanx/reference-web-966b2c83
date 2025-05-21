
import { useState } from 'react';
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
import { pricingFormSchema, PricingFormValues, usePricingPlans } from '@/hooks/use-pricing-plans';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PricingPlanCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingPlanCreateDialog = ({ isOpen, onOpenChange }: PricingPlanCreateDialogProps) => {
  const { user } = useAuth();
  const { createPricingMutation } = usePricingPlans(user?.id, true);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      title: "",
      price: 0,
      active: true
    }
  });

  const onSubmit = (values: PricingFormValues) => {
    setError(null);
    createPricingMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        setError(error.message);
      }
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Reset the form and error state when dialog is closed
          form.reset();
          setError(null);
        }
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pricing Plan</DialogTitle>
          <DialogDescription>
            Create a new pricing plan to offer to your customers.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
                <Button variant="outline" type="button" disabled={createPricingMutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createPricingMutation.isPending}
              >
                {createPricingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingPlanCreateDialog;
