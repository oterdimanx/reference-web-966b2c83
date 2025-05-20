
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminMenu from '@/components/Admin/AdminMenu';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Define the pricing plan type
interface PricingPlan {
  id: string;
  title: string;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Form schema
const pricingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price must be 0 or higher"),
  active: z.boolean().default(true)
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

const AdminPricing = () => {
  const { user, loading, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch pricing plans
  const { data: pricingPlans, isLoading } = useQuery({
    queryKey: ['pricing-plans', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data as PricingPlan[];
    },
    enabled: !!user && isAdmin
  });
  
  // Form for adding/editing pricing plans
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      title: "",
      price: 0,
      active: true
    }
  });
  
  // Create pricing plan mutation
  const createPricingMutation = useMutation({
    mutationFn: async (values: PricingFormValues) => {
      const { data, error } = await supabase
        .from('pricing')
        .insert(values)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast.success("Pricing plan created successfully");
      setIsCreating(false);
      form.reset();
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
        .update(values)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast.success("Pricing plan updated successfully");
      setIsEditing(null);
      form.reset();
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
      setPlanToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete pricing plan: ${error.message}`);
    }
  });
  
  // Handle form submission
  const onSubmit = (values: PricingFormValues) => {
    if (isEditing) {
      updatePricingMutation.mutate({ id: isEditing, values });
    } else {
      createPricingMutation.mutate(values);
    }
  };
  
  // Set form values when editing
  const handleEdit = (plan: PricingPlan) => {
    setIsEditing(plan.id);
    form.reset({
      title: plan.title,
      price: plan.price,
      active: plan.active
    });
  };
  
  // Handle create new plan
  const handleCreate = () => {
    setIsEditing(null);
    form.reset({
      title: "",
      price: 0,
      active: true
    });
    setIsCreating(true);
  };
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Pricing Plans Management</h1>
        
        <AdminMenu />
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Manage your pricing plans here. Changes will be reflected on the website.</p>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Pricing Plan</DialogTitle>
                <DialogDescription>
                  Create a new pricing plan to offer to your customers.
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
                    <Button type="submit" disabled={createPricingMutation.isPending}>
                      {createPricingMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-slate-100"></CardHeader>
                <CardContent className="h-32 bg-slate-50"></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPlans?.map((plan) => (
              <Card key={plan.id} className={!plan.active ? "opacity-60" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{plan.title}</span>
                    <div className="flex gap-1">
                      <Dialog open={isEditing === plan.id} onOpenChange={(open) => {
                        if (!open) setIsEditing(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
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
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setPlanToDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${plan.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                  
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={plan.active ? "text-green-600" : "text-gray-500"}>
                        {plan.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Last Updated:</span>
                      <span className="text-muted-foreground">
                        {new Date(plan.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the pricing plan. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => planToDelete && deletePricingMutation.mutate(planToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePricingMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPricing;
