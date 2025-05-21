
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddAdminFormProps {
  onAdminAdded: (email: string, userId: string) => void;
}

const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMakeAdmin = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw userError;
      }

      const user = userData.users.find(u => u.email === emailInput.trim());
      
      if (!user) {
        toast.error('User not found. Please check the email address');
        return;
      }

      // Now add the admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })
        .select();

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          toast.info('This user is already an admin');
        } else {
          throw error;
        }
      } else {
        toast.success(`${emailInput} is now an admin`);
        onAdminAdded(user.email || "", user.id);
        setEmailInput('');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input 
        placeholder="User email address" 
        value={emailInput} 
        onChange={(e) => setEmailInput(e.target.value)} 
        type="email"
        className="flex-grow"
      />
      <Button 
        className="bg-rank-teal hover:bg-rank-teal/90"
        onClick={handleMakeAdmin}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Make Admin'}
      </Button>
    </div>
  );
};

export default AddAdminForm;
