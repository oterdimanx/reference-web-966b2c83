
import { useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminMenu from '@/components/Admin/AdminMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  
  // Fetch summary data
  const { data: websitesCount } = useQuery({
    queryKey: ['admin', 'websites-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    enabled: !!user && isAdmin
  });
  
  const { data: usersCount } = useQuery({
    queryKey: ['admin', 'users-count'],
    queryFn: async () => {
      const { data } = await supabase.auth.admin.listUsers();
      return data?.users?.length || 0;
    },
    enabled: !!user && isAdmin
  });
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <AdminMenu />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : usersCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? '...' : websitesCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">2</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Welcome to the admin dashboard. Use the navigation above to manage different aspects of your application.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
