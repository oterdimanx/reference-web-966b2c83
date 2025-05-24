
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import AdminMenu from '@/components/Admin/AdminMenu';
import { EventAnalytics } from '@/components/Admin/EventAnalytics';
import { TrackingScriptGenerator } from '@/components/Admin/TrackingScriptGenerator';

const AdminAnalytics = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Analytics</h1>
        
        <AdminMenu />
        
        <div className="space-y-8">
          <TrackingScriptGenerator />
          <EventAnalytics />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;
