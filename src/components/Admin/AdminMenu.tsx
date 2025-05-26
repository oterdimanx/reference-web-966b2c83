
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, Settings, ArrowLeftCircle, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Determine if the current path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Special check for exact admin route (user management)
  const isExactAdmin = () => {
    return location.pathname === '/admin';
  };
  
  // Handle navigation to home page
  const handleReturnToFront = () => {
    navigate('/');
  };
  
  return (
    <div className="bg-slate-100 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-3">{t('admin', 'navigationTitle')}</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isActive('/admin/dashboard-rw') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin/dashboard-rw">
            <Home className="mr-2 h-4 w-4" />
            {t('admin', 'dashboard')}
          </Link>
        </Button>
        
        <Button
          variant={isActive('/admin/analytics') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </Button>
        
        <Button
          variant={isActive('/admin/pricing') ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin/pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            {t('admin', 'pricing')}
          </Link>
        </Button>
        
        <Button
          variant={isExactAdmin() ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to="/admin">
            <Settings className="mr-2 h-4 w-4" />
            {t('admin', 'userManagement')}
          </Link>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleReturnToFront}
          className="ml-auto"
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          {t('common', 'returnToFront')}
        </Button>
      </div>
    </div>
  );
};

export default AdminMenu;
