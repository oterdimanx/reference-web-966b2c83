
import { useState, useEffect } from 'react';
import { StatCard } from '@/components/common/StatCard';
import { AddWebsiteForm } from '@/components/RankTracker/AddWebsiteForm';
import { WebsiteList } from '@/components/RankTracker/WebsiteList';
import { RankingChart } from '@/components/RankTracker/RankingChart';
import { 
  mockRankingData, 
  getRankingSummaries, 
  getOverallStats,
  RankingSummary 
} from '@/lib/mockData';
import { Check, Globe, Search, TrendingUp, Award } from 'lucide-react';
import { getUserWebsites } from '@/services/websiteService';

export function DashboardView() {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('1');
  const [websites, setWebsites] = useState<RankingSummary[]>([]);
  const [overallStats, setOverallStats] = useState(getOverallStats());
  
  // Fetch websites from Supabase on component mount
  useEffect(() => {
    const fetchWebsites = async () => {
      const userWebsites = await getUserWebsites();
      
      if (userWebsites.length > 0) {
        setWebsites(userWebsites);
        // Set the first website as selected if we have any
        setSelectedWebsiteId(userWebsites[0].websiteId);
        
        // Update overall stats based on the loaded websites
        updateOverallStats(userWebsites);
      } else {
        // Fall back to mock data if no user websites exist
        const mockWebsites = getRankingSummaries();
        setWebsites(mockWebsites);
      }
    };
    
    fetchWebsites();
  }, []);
  
  // Calculate and update overall stats based on the website list
  const updateOverallStats = (websitesList: RankingSummary[]) => {
    if (websitesList.length === 0) return;
    
    const totalKeywords = websitesList.reduce((sum, site) => sum + site.keywordCount, 0);
    const avgPosition = Math.round(
      websitesList.reduce((sum, site) => sum + site.avgPosition, 0) / websitesList.length
    );
    const improvingWebsites = websitesList.filter(site => site.change >= 0).length;
    
    // Find the top website (with the best/lowest average position)
    const topWebsite = websitesList.sort((a, b) => a.avgPosition - b.avgPosition)[0]?.domain || 'N/A';
    
    setOverallStats({
      totalWebsites: websitesList.length,
      totalKeywords: totalKeywords,
      avgPosition: avgPosition,
      improvingWebsites: improvingWebsites,
      topWebsite: topWebsite
    });
  };
  
  const websiteRankingData = mockRankingData.filter(
    data => data.websiteId === selectedWebsiteId
  );
  
  const handleAddWebsite = (newWebsite: RankingSummary) => {
    // Add the new website to the state
    const updatedWebsites = [newWebsite, ...websites];
    setWebsites(updatedWebsites);
    
    // Update overall stats
    updateOverallStats(updatedWebsites);
    
    // Set the new website as selected
    setSelectedWebsiteId(newWebsite.websiteId);
  };
  
  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Websites Tracked"
            value={overallStats.totalWebsites}
            icon={<Globe className="h-5 w-5" />}
          />
          <StatCard
            title="Total Keywords"
            value={overallStats.totalKeywords}
            icon={<Search className="h-5 w-5" />}
          />
          <StatCard
            title="Average Position"
            value={`#${overallStats.avgPosition}`}
            icon={<Award className="h-5 w-5" />}
          />
          <StatCard
            title="Improving Websites"
            value={`${overallStats.improvingWebsites} of ${overallStats.totalWebsites}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Website ranking chart */}
            <RankingChart data={websiteRankingData} />
            
            {/* Website list */}
            <WebsiteList
              websites={websites}
              onSelectWebsite={setSelectedWebsiteId}
              selectedWebsiteId={selectedWebsiteId}
            />
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <AddWebsiteForm onAddWebsite={handleAddWebsite} />
            
            {/* Quick tips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Focus on high-volume, low-competition keywords
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Update your content regularly to improve rankings
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Build quality backlinks to boost your domain authority
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Optimize page speed for better user experience and rankings
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
