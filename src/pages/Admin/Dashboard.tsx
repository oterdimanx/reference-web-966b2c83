
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminMenu from '@/components/Admin/AdminMenu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/components/Admin/AdminStats';
import { TranslationManager } from '@/components/Admin/TranslationManager';
import { useAdminUsers } from '@/hooks/use-admin-users';

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  
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
  
  const { users } = useAdminUsers(isAdmin);
  const usersCount = users.length;
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('admin', 'dashboard')}</h1>
        
        <AdminMenu />
        
        <AdminStats 
          usersCount={usersCount}
          websitesCount={websitesCount}
          loading={loading}
        />
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('admin', 'recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin', 'welcomeMessage')}</p>
          </CardContent>
        </Card>
        
        <TranslationManager />
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
