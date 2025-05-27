
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function LogoSection() {
  const { t } = useLanguage();

  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="hidden md:block text-2xl font-bold bg-gradient-to-r from-rank-teal to-blue-600 text-transparent bg-clip-text">
        {t('homepage', 'title')}
      </span>
      <img 
        src="/lovable-uploads/1741536e-ddb0-4a3b-9688-56cf3cbe998e.png" 
        alt="Reference-Web Logo" 
        className="md:hidden h-10 w-auto hover:opacity-80 transition-opacity"
      />
    </Link>
  );
}
