
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedView } from '@/components/Keywords/AuthenticatedView';
import { GuestView } from '@/components/Keywords/GuestView';
import { RankingDebugTest } from '@/components/Debug/RankingDebugTest';
import { supabase } from '@/integrations/supabase/client';

const KeywordsPage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hasWebsitesWithKeywords, setHasWebsitesWithKeywords] = useState(false);
  const [checkingWebsites, setCheckingWebsites] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      checkWebsitesWithKeywords();
    } else if (!loading) {
      setCheckingWebsites(false);
    }
  }, [user, loading]);

  const checkWebsitesWithKeywords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .not('keywords', 'is', null)
        .not('keywords', 'eq', '')
        .limit(1);

      if (error) throw error;
      setHasWebsitesWithKeywords((data || []).length > 0);
    } catch (error) {
      console.error('Error checking websites:', error);
    } finally {
      setCheckingWebsites(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('pages', 'keywords')}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('allWebsitesPage', 'backToDashboard')}
          </Button>
        </div>

        {loading || checkingWebsites ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : user && hasWebsitesWithKeywords ? (
          <>
            <AuthenticatedView />
            <div className="mt-8">
              <RankingDebugTest />
            </div>
          </>
        ) : (
          <GuestView />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KeywordsPage;
