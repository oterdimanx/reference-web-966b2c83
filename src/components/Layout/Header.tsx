
import React, { useState } from 'react';
import { LanguageSwitch } from '@/components/Layout/LanguageSwitch';
import { ThemeToggle } from '@/components/Layout/ThemeToggle';
import { LogoSection } from '@/components/Layout/LogoSection';
import { MobileMenu } from '@/components/Layout/MobileMenu';
import { DesktopNavigation } from '@/components/Layout/DesktopNavigation';
import { UserSection } from '@/components/Layout/UserSection';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 relative">
      <div className="container mx-auto flex justify-between items-center p-4">
        <LogoSection />
        
        {isMobile ? (
          <>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSwitch />
              <button onClick={toggleMobileMenu} className="p-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <MobileMenu isOpen={mobileMenuOpen} onClose={toggleMobileMenu} />
          </>
        ) : (
          <div className="flex items-center space-x-6">
            <DesktopNavigation />
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitch />
              <UserSection />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
