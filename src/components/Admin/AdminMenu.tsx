
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, Settings, ArrowLeftCircle } from 'lucide-react';

const AdminMenu = () => {
  const location = useLocation();
  
  // Determine if the current path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="bg-slate-100 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-3">Admin Navigation</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isActive('/admin/dashboard-rw') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin/dashboard-rw">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        
        <Button
          variant={isActive('/admin/pricing') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin/pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            Pricing Plans
          </Link>
        </Button>
        
        <Button
          variant={isActive('/admin') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin">
            <Settings className="mr-2 h-4 w-4" />
            User Management
          </Link>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          asChild
          className="ml-auto"
        >
          <Link to="/">
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Return to Front
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminMenu;
