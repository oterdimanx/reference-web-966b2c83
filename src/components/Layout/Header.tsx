
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitch } from '@/components/Layout/LanguageSwitch';
import { ThemeToggle } from '@/components/Layout/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return '??';
    return user.email.substring(0, 2).toUpperCase();
  };
  
  const renderMobileMenu = () => {
    if (!mobileMenuOpen) return null;
    
    return (
      <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 p-4">
        <div className="flex flex-col space-y-4">
          <Link to="/" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
            {t('common', 'home')}
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
            {t('common', 'about')}
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/all-websites" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
                {t('common', 'allWebsites')}
              </Link>
              <Link to="/add-website" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
                {t('common', 'addWebsite')}
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
                {t('common', 'profile')}
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard-rw" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
                  {t('common', 'admin')}
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  toggleMobileMenu();
                }}
                className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal text-left"
              >
                {t('common', 'signOut')}
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={toggleMobileMenu}>
              {t('common', 'login')}
            </Link>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 relative">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center space-x-2">
          {/* Show text title on desktop (md and up), image on smaller screens */}
          <span className="hidden md:block text-2xl font-bold bg-gradient-to-r from-rank-teal to-blue-600 text-transparent bg-clip-text">
            {t('homepage', 'title')}
          </span>
          <img 
            src="/lovable-uploads/1741536e-ddb0-4a3b-9688-56cf3cbe998e.png" 
            alt="Reference-Web Logo" 
            className="md:hidden h-10 w-auto hover:opacity-80 transition-opacity"
          />
        </Link>
        
        {isMobile ? (
          <>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSwitch />
              <button onClick={toggleMobileMenu} className="p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            {renderMobileMenu()}
          </>
        ) : (
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal">
                {t('common', 'home')}
              </Link>
              
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                      {t('common', 'about')}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <div className="p-2 w-48">
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
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitch />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t('common', 'profile')}</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard-rw">{t('common', 'admin')}</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      {t('common', 'signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-rank-teal hover:bg-rank-teal/90">
                  <Link to="/auth">{t('common', 'login')}</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
