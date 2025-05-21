
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Add admin mutation
  const addAdminMutation = useMutation<AddAdminResult, Error, string>({
    mutationFn: async (email: string): Promise<AddAdminResult> => {
      // First check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

      if (userError) {
        throw userError;
      }

      const user = userData.users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found with this email address');
      }

      // Check if user already has admin role
      const { data: existingRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (roleError) {
        throw roleError;
      }

      if (existingRole && existingRole.length > 0) {
        throw new Error('User already has admin role');
      }

      // Add admin role to user
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
        });

      if (insertError) {
        throw insertError;
      }

      return { email, userId: user.id };
    },
    onSuccess: (data) => {
      toast.success(`Admin role granted to ${data.email}`);
      form.reset();
      onAdminAdded(data.email, data.userId);
    },
    onError: (error) => {
      toast.error(`Error adding admin: ${error.message}`);
    }
  });

  const onSubmit = async (values: AdminFormValues) => {
    addAdminMutation.mutate(values.email);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
