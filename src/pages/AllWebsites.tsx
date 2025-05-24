
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { WebsiteList } from '@/components/RankTracker/WebsiteList';
import { RankingSummary } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserWebsites } from '@/services/websiteService';
import { useLanguage } from '@/contexts/LanguageContext';

const AllWebsites = () => {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | undefined>(undefined);
  const [websites, setWebsites] = useState<RankingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Fetch websites from Supabase
  useEffect(() => {
    const fetchWebsites = async () => {
      setIsLoading(true);
      const userWebsites = await getUserWebsites();
      setWebsites(userWebsites);
      
      if (userWebsites.length > 0) {
        setSelectedWebsiteId(userWebsites[0].websiteId);
      }
      
      setIsLoading(false);
    };
    
    fetchWebsites();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('allWebsitesPage', 'title')}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('allWebsitesPage', 'backToDashboard')}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('allWebsitesPage', 'completeWebsiteRankings')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">{t('allWebsitesPage', 'loadingWebsites')}</div>
            ) : (
              <WebsiteList 
                websites={websites}
                onSelectWebsite={setSelectedWebsiteId}
                selectedWebsiteId={selectedWebsiteId}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AllWebsites;
