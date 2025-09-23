
import { RankingChart } from '@/components/RankTracker/RankingChart';
import { WebsiteList } from '@/components/RankTracker/WebsiteList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RankingSummary } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

interface MainDashboardContentProps {
  websites: RankingSummary[];
  selectedWebsiteId: string;
  onSelectWebsite: (websiteId: string) => void;
  websiteRankingData: any[];
  isLoadingRankings?: boolean;
}

export function MainDashboardContent({ 
  websites, 
  selectedWebsiteId, 
  onSelectWebsite, 
  websiteRankingData,
  isLoadingRankings = false
}: MainDashboardContentProps) {
  const { t } = useLanguage();
  return (
    <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Website ranking chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{t('common', 'keywordRankings')}</h3>
          <Button asChild variant="outline" size="sm">
            <Link to="/keywords">
              {t('common', 'manageKeywords')}
            </Link>
          </Button>
        </div>
        {isLoadingRankings ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('common', 'loadingRankingData')}
          </div>
        ) : (
          <RankingChart data={websiteRankingData} />
        )}
      </div>
      
      {/* Website list */}
      <WebsiteList
        websites={websites}
        onSelectWebsite={onSelectWebsite}
        selectedWebsiteId={selectedWebsiteId}
      />
    </div>
  );
}
