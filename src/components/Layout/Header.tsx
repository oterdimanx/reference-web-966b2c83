
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const isMobile = useMobile();
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
      <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50 p-4">
        <div className="flex flex-col space-y-4">
          <Link to="/" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
            About
          </Link>
          {user ? (
            <>
              <Link to="/all-websites" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
                All Websites
              </Link>
              <Link to="/add-website" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
                Add Website
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
                Profile
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard-rw" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  toggleMobileMenu();
                }}
                className="text-gray-600 hover:text-rank-teal text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-gray-600 hover:text-rank-teal" onClick={toggleMobileMenu}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <header className="bg-white border-b border-slate-200 relative">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-rank-teal to-blue-600 text-transparent bg-clip-text">
            ReferenceRank
          </span>
        </Link>
        
        {isMobile ? (
          <>
            <button onClick={toggleMobileMenu} className="p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {renderMobileMenu()}
          </>
        ) : (
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-rank-teal">
                Home
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-rank-teal">
                About
              </Link>
              {user && (
                <>
                  <Link to="/all-websites" className="text-gray-600 hover:text-rank-teal">
                    All Websites
                  </Link>
                  <Link to="/add-website" className="text-gray-600 hover:text-rank-teal">
                    Add Website
                  </Link>
                </>
              )}
            </nav>
            
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
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard-rw">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-rank-teal hover:bg-rank-teal/90">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
