
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [isDirectoriesOpen, setIsDirectoriesOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 p-4">
      <div className="flex flex-col space-y-4">
        <Link to="/" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
          {t('common', 'home')}
        </Link>
        
        <div>
          <button
            onClick={() => setIsDirectoriesOpen(!isDirectoriesOpen)}
            className="flex items-center justify-between w-full text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal"
          >
            Directories
            {isDirectoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isDirectoriesOpen && (
            <div className="ml-4 mt-2 space-y-2">
              <Link to="/directories" className="block text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
                Directories
              </Link>
              <Link to="/about" className="block text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
                {t('common', 'about')}
              </Link>
              <Link to="/pricing" className="block text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
                Pricing
              </Link>
            </div>
          )}
        </div>
        
        {user ? (
          <>
            <Link to="/all-websites" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
              {t('common', 'allWebsites')}
            </Link>
            <Link to="/add-website" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
              {t('common', 'addWebsite')}
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
              {t('common', 'profile')}
            </Link>
            {isAdmin && (
              <Link to="/admin/dashboard-rw" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
                {t('common', 'admin')}
              </Link>
            )}
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal text-left"
            >
              {t('common', 'signOut')}
            </button>
          </>
        ) : (
          <Link to="/auth" className="text-gray-600 hover:text-rank-teal dark:text-gray-300 dark:hover:text-rank-teal" onClick={onClose}>
            {t('common', 'login')}
          </Link>
        )}
      </div>
    </div>
  );
}
