
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, User, LogOut, Settings, BarChart, DollarSign, FolderTree, Globe, TrendingUp, Trophy, Search } from 'lucide-react';

export function UserSection() {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useLanguage();

  const getUserInitials = () => {
    if (!user || !user.email) return '??';
    return user.email.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <Button asChild className="bg-rank-teal hover:bg-rank-teal/90">
        <Link to="/auth">{t('common', 'login')}</Link>
      </Button>
    );
  }

  return (
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
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            {t('common', 'profile')}
          </Link>
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                {t('admin', 'navigationTitle')}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard-rw" className="flex items-center w-full">
                      <BarChart className="mr-2 h-4 w-4" />
                      {t('admin', 'dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/pricing" className="flex items-center w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      {t('admin', 'pricing')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/categories" className="flex items-center w-full">
                      <FolderTree className="mr-2 h-4 w-4" />
                      {t('admin', 'categories')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/directory" className="flex items-center w-full">
                      <Globe className="mr-2 h-4 w-4" />
                      {t('admin', 'directory')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/analytics" className="flex items-center w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {t('admin', 'analytics')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/rankings" className="flex items-center w-full">
                      <Trophy className="mr-2 h-4 w-4" />
                      {t('admin', 'rankings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/seo" className="flex items-center w-full">
                      <Search className="mr-2 h-4 w-4" />
                      {t('admin', 'seoManagement')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          {t('common', 'signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
