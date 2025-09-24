
import { RankingChart } from '@/components/RankTracker/RankingChart';
import { WebsiteList } from '@/components/RankTracker/WebsiteList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RankingSummary } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MainDashboardContentProps {
  websites: RankingSummary[];
  selectedWebsiteId: string;
  onSelectWebsite: (websiteId: string) => void;
  websiteRankingData: any[];
  isLoadingRankings?: boolean;
  websitesWithData: { websiteId: string; domain: string }[];
}

export function MainDashboardContent({ 
  websites, 
  selectedWebsiteId, 
  onSelectWebsite, 
  websiteRankingData,
  isLoadingRankings = false,
  websitesWithData
}: MainDashboardContentProps) {
  const { t } = useLanguage();
  return (
    <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Website ranking chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{t('common', 'keywordRankings')}</h3>
          <div className="flex items-center gap-2">
            {websitesWithData.length > 1 && (
              <Select value={selectedWebsiteId} onValueChange={onSelectWebsite}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('common', 'selectWebsite')} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {websitesWithData.map((website) => (
                    <SelectItem key={website.websiteId} value={website.websiteId}>
                      {website.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to="/keywords">
                {t('common', 'manageKeywords')}
              </Link>
            </Button>
          </div>
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
