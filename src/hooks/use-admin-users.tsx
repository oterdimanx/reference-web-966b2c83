
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

  // Fetch users with their roles
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        // First get all users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }

        // Then get all roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) {
          throw rolesError;
        }

        // Match users with roles
        const usersWithRoles = authUsers.users.map(authUser => {
          const userRole = roles?.find(role => role.user_id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email || null,
            role: userRole ? userRole.role : 'user'
          };
        });

        setUsers(usersWithRoles);
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
