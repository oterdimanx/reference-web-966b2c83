
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 rounded gradient-bg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">WRB</span>
              </div>
              <span className="font-bold text-xl text-rank-blue dark:text-white">
                Web<span className="text-rank-teal">Rank</span>Beacon
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Dashboard
            </Link>
            <Link to="/rankings" className="text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Rankings
            </Link>
            <Link to="/keywords" className="text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Keywords
            </Link>
            <Button variant="default" size="sm" className="bg-rank-teal hover:bg-rank-teal/90">
              Add Website
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-4 animate-fade-in">
            <Link to="/" className="block py-2 text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Dashboard
            </Link>
            <Link to="/rankings" className="block py-2 text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Rankings
            </Link>
            <Link to="/keywords" className="block py-2 text-gray-700 hover:text-rank-blue dark:text-gray-200 dark:hover:text-white font-medium">
              Keywords
            </Link>
            <Button variant="default" className="w-full bg-rank-teal hover:bg-rank-teal/90">
              Add Website
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
