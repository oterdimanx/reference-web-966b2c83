
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Home, DollarSign, Settings, ArrowLeftCircle, BarChart3, Globe, Tags, TrendingUp, Activity, Search, MessageSquare } from 'lucide-react';

export function DesktopNavigation() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Determine if the current path is active for admin menu
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Special check for exact admin route (user management)
  const isExactAdmin = () => {
    return location.pathname === '/admin';
  };

  return (
    <nav className="flex items-center space-x-6">
      <Link to="/" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal">
        {t('common', 'home')}
      </Link>
      
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
              {t('common', 'directories')}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-2 w-48">
                <Link
                  to="/directories"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700 rounded"
                >
                  {t('common', 'directories')}
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700 rounded"
                >
                  {t('common', 'about')}
                </Link>
                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700 rounded"
                >
                  Pricing
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {user && isAdmin && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                {t('admin', 'navigationTitle')}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="p-2 w-56">
                  <Link
                    to="/admin/dashboard-rw"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/dashboard-rw') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {t('admin', 'dashboard')}
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/analytics') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                  <Link
                    to="/admin/rankings"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/rankings') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Rankings
                  </Link>
                  <Link
                    to="/admin/directory"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/directory') && !isActive('/admin/directory/categories') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Directory
                  </Link>
                  <Link
                    to="/admin/directory/categories"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/directory/categories') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Tags className="mr-2 h-4 w-4" />
                    Categories
                  </Link>
                  <Link
                    to="/admin/pricing"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/pricing') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    {t('admin', 'pricing')}
                  </Link>
                  <Link
                    to="/admin/test-schedule-rankings"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/test-schedule-rankings') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    {t('admin', 'testScheduleRankings')}
                  </Link>
                  <Link
                    to="/admin"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isExactAdmin() 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t('admin', 'userManagement')}
                  </Link>
                  <Link
                    to="/admin/contact"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/contact') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('admin', 'contactManagement')}
                  </Link>
                  <Link
                    to="/admin/seo"
                    className={`flex items-center px-4 py-2 text-sm rounded ${
                      isActive('/admin/seo') 
                        ? 'bg-rank-teal text-white' 
                        : 'text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700'
                    }`}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {t('admin', 'seoManagement')}
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700 rounded"
                  >
                    <ArrowLeftCircle className="mr-2 h-4 w-4" />
                    {t('common', 'returnToFront')}
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
      
      {user && (
        <>
          <Link to="/all-websites" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal">
            {t('common', 'allWebsites')}
          </Link>
          <Link to="/add-website" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal">
            {t('common', 'addWebsite')}
          </Link>
        </>
      )}
    </nav>
  );
}
