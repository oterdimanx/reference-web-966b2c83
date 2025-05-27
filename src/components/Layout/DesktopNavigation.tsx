
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export function DesktopNavigation() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="flex items-center space-x-6">
      <Link to="/" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal">
        {t('common', 'home')}
      </Link>
      
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
              Directories
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-2 w-48">
                <Link
                  to="/directories"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-rank-teal hover:bg-gray-100 dark:text-gray-300 dark:hover:text-rank-teal dark:hover:bg-gray-700 rounded"
                >
                  Directories
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
