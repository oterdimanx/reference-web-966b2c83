
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

import { DirectoryManagement } from '@/components/Admin/DirectoryManagement';

const AdminDirectory = () => {
  const { user, loading, isAdmin } = useAuth();
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Directory Management</h1>
        
        <DirectoryManagement />
      </main>
      <Footer />
    </div>
  );
};

export default AdminDirectory;
