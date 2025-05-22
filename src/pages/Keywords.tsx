
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthenticatedView } from '@/components/Keywords/AuthenticatedView';
import { GuestView } from '@/components/Keywords/GuestView';

const KeywordsPage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('pages', 'keywords')}</h1>

        {loading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : user ? (
          <AuthenticatedView />
        ) : (
          <GuestView />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KeywordsPage;
