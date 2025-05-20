
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Type for user with role
interface UserWithRole {
  id: string;
  email: string;
  role: string;
}

const AdminPage = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>('');

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data ? true : false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

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
            email: authUser.email || 'No email',
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

  // Handle making a user an admin
  const handleMakeAdmin = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

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
        
        // Update the local user list
        setUsers(prev => {
          const newUsers = [...prev];
          const userIndex = newUsers.findIndex(u => u.id === user.id);
          
          if (userIndex >= 0) {
            newUsers[userIndex] = { ...newUsers[userIndex], role: 'admin' };
          } else {
            newUsers.push({
              id: user.id,
              email: user.email || 'No email',
              role: 'admin'
            });
          }
          
          return newUsers;
        });
        
        setEmailInput('');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to update user role');
    }
  };

  // If not logged in, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  // If loading admin status
  if (loading || adminLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h2>
                <p className="mb-6 text-muted-foreground">
                  You don't have administrator privileges to access this page.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = '/'}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
              <CardDescription>
                Grant administrator privileges to another user
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                >
                  Make Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Email</th>
                          <th className="text-left py-2 px-4">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="py-2 px-4">{user.email}</td>
                              <td className="py-2 px-4">
                                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                  {user.role}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-muted-foreground">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
