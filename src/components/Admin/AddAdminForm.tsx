
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form schema
const adminFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

interface AddAdminFormProps {
  onAdminAdded: (email: string, userId: string) => void;
}

// Define the expected response type from the mutation
interface AddAdminResult {
  email: string;
  userId: string;
}

const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);

  // Form setup
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Add admin mutation using edge function
  const addAdminMutation = useMutation<AddAdminResult, Error, string>({
    mutationFn: async (email: string): Promise<AddAdminResult> => {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('add-admin', {
        body: { email },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to add admin');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success || !data?.email || !data?.userId) {
        throw new Error('Invalid response from server');
      }

      return {
        email: data.email,
        userId: data.userId
      };
    },
    onSuccess: (data) => {
      toast.success(`Admin role granted to ${data.email}`);
      form.reset();
      onAdminAdded(data.email, data.userId);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      toast.error(`Error adding admin: ${error.message}`);
    }
  });

  const onSubmit = async (values: AdminFormValues) => {
    addAdminMutation.mutate(values.email);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter the email address of the user you want to grant admin privileges to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={addAdminMutation.isPending}
        >
          {addAdminMutation.isPending ? 'Adding Admin...' : 'Add Admin'}
        </Button>
      </form>
    </Form>
  );
};

export default AddAdminForm;
