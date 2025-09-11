
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

import PricingPlanList from '@/components/Admin/Pricing/PricingPlanList';
import PricingPlanCreateDialog from '@/components/Admin/Pricing/PricingPlanCreateDialog';

const AdminPricing = () => {
  const { user, loading, isAdmin } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // If not logged in or not admin, redirect
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Pricing Plans Management</h1>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Manage your pricing plans here. Changes will be reflected on the website.</p>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Plan
          </Button>
        </div>
        
        <PricingPlanList />
        
        <PricingPlanCreateDialog 
          isOpen={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default AdminPricing;
