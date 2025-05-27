
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for user with role
interface UserWithRole {
  id: string;
  email: string | null;
  role: string;
}

export const useAdminUsers = (isAdmin: boolean) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  // Fetch users with their roles using edge function
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) {
        setUsersLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No valid session found');
        }

        // Call the edge function
        const { data, error } = await supabase.functions.invoke('admin-users', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (data?.users) {
          setUsers(data.users);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setUsersLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const addNewAdmin = (email: string, userId: string) => {
    setUsers(prev => {
      const newUsers = [...prev];
      const userIndex = newUsers.findIndex(u => u.id === userId);
      
      if (userIndex >= 0) {
        newUsers[userIndex] = { ...newUsers[userIndex], role: 'admin' };
      } else {
        newUsers.push({
          id: userId,
          email: email,
          role: 'admin'
        });
      }
      
      return newUsers;
    });
  };

  return {
    users,
    usersLoading,
    addNewAdmin
  };
};
