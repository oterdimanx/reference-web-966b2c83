
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 1).toUpperCase();
  };

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
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-rank-teal hover:bg-rank-teal/90"
                  onClick={() => navigate('/add-website')}
                >
                  Add Website
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                      <AvatarFallback className="bg-rank-blue text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-rank-teal hover:bg-rank-teal/90"
                onClick={handleAuthClick}
              >
                Sign In
              </Button>
            )}
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
            
            {user ? (
              <>
                <Button 
                  variant="default" 
                  className="w-full bg-rank-teal hover:bg-rank-teal/90 mb-2"
                  onClick={() => navigate('/add-website')}
                >
                  Add Website
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Button>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                className="w-full bg-rank-teal hover:bg-rank-teal/90"
                onClick={handleAuthClick}
              >
                Sign In
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
