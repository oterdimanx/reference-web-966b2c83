import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHasWebsiteEvents } from '@/hooks/useHasWebsiteEvents';

export const WorldViewButton: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { hasEvents, isLoading } = useHasWebsiteEvents();

  // Only show if user is authenticated and has website events
  if (!user || isLoading || !hasEvents) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      asChild
      className="flex items-center"
    >
      <Link to="/worldview">
        <Globe size={16} className="mr-1" />
        <span className="hidden xs:inline">{t('worldViewPage', 'title')}</span>
      </Link>
    </Button>
  );
};