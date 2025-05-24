
import { useState, useEffect } from 'react';
import { AddWebsiteForm } from '@/components/RankTracker/AddWebsiteForm';
import { 
  mockRankingData, 
  getRankingSummaries, 
  getOverallStats,
  RankingSummary 
} from '@/lib/mockData';
import { getUserWebsites } from '@/services/websiteService';
import { StatsSection } from './StatsSection';
import { MainDashboardContent } from './MainDashboardContent';
import { QuickTipsCard } from './QuickTipsCard';

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
        <StatsSection overallStats={overallStats} />
        
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MainDashboardContent
            websites={websites}
            selectedWebsiteId={selectedWebsiteId}
            onSelectWebsite={setSelectedWebsiteId}
            websiteRankingData={websiteRankingData}
          />
          
          {/* Right sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <AddWebsiteForm onAddWebsite={handleAddWebsite} />
            <QuickTipsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
