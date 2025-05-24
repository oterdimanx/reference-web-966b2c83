
export interface Website {
  id: string;
  domain: string;
  keywords: string[];
  added: string;
  status: 'tracking' | 'paused';
}

export interface RankingData {
  websiteId: string;
  keyword: string;
  rankings: {
    date: string;
    position: number;
  }[];
}

export interface RankingSummary {
  websiteId: string;
  domain: string;
  title?: string;
  description?: string;
  imagePath?: string;
  avgPosition: number;
  topKeyword: string;
  topKeywordPosition: number;
  keywordCount: number;
  change: number;
}

export const mockWebsites: Website[] = [
  {
    id: '1',
    domain: 'example.com',
    keywords: ['web development', 'react', 'javascript', 'frontend'],
    added: '2023-04-15',
    status: 'tracking'
  },
  {
    id: '2',
    domain: 'techblog.co',
    keywords: ['tech news', 'programming', 'software development'],
    added: '2023-05-22',
    status: 'tracking'
  },
  {
    id: '3',
    domain: 'designhub.io',
    keywords: ['ui design', 'user experience', 'ux research'],
    added: '2023-06-10',
    status: 'tracking'
  },
  {
    id: '4',
    domain: 'marketingpro.net',
    keywords: ['digital marketing', 'seo strategy', 'content marketing'],
    added: '2023-07-05',
    status: 'paused'
  },
];

export const mockRankingData: RankingData[] = [
  {
    websiteId: '1',
    keyword: 'web development',
    rankings: [
      { date: '2023-04-20', position: 28 },
      { date: '2023-04-27', position: 25 },
      { date: '2023-05-04', position: 21 },
      { date: '2023-05-11', position: 19 },
      { date: '2023-05-18', position: 15 },
      { date: '2023-05-25', position: 12 },
      { date: '2023-06-01', position: 10 },
      { date: '2023-06-08', position: 8 },
      { date: '2023-06-15', position: 7 },
      { date: '2023-06-22', position: 5 }
    ]
  },
  {
    websiteId: '1',
    keyword: 'react',
    rankings: [
      { date: '2023-04-20', position: 45 },
      { date: '2023-04-27', position: 42 },
      { date: '2023-05-04', position: 38 },
      { date: '2023-05-11', position: 35 },
      { date: '2023-05-18', position: 30 },
      { date: '2023-05-25', position: 28 },
      { date: '2023-06-01', position: 25 },
      { date: '2023-06-08', position: 22 },
      { date: '2023-06-15', position: 20 },
      { date: '2023-06-22', position: 18 }
    ]
  },
  {
    websiteId: '2',
    keyword: 'tech news',
    rankings: [
      { date: '2023-05-28', position: 32 },
      { date: '2023-06-04', position: 28 },
      { date: '2023-06-11', position: 25 },
      { date: '2023-06-18', position: 20 },
      { date: '2023-06-25', position: 16 },
      { date: '2023-07-02', position: 14 },
      { date: '2023-07-09', position: 11 },
      { date: '2023-07-16', position: 9 }
    ]
  }
];

export const getRankingSummaries = (): RankingSummary[] => {
  return mockWebsites.map(website => {
    const websiteRankings = mockRankingData.filter(r => r.websiteId === website.id);
    
    // Default values if no ranking data
    if (websiteRankings.length === 0) {
      return {
        websiteId: website.id,
        domain: website.domain,
        title: undefined,
        description: undefined,
        imagePath: undefined,
        avgPosition: 0,
        topKeyword: 'N/A',
        topKeywordPosition: 0,
        keywordCount: website.keywords.length,
        change: 0
      };
    }
    
    // Find the best keyword position
    let bestKeyword = '';
    let bestPosition = 1000;
    
    websiteRankings.forEach(data => {
      const latestRanking = data.rankings[data.rankings.length - 1];
      if (latestRanking.position < bestPosition) {
        bestPosition = latestRanking.position;
        bestKeyword = data.keyword;
      }
    });
    
    // Calculate average position across all keywords
    let totalPositions = 0;
    let positionCount = 0;
    
    websiteRankings.forEach(data => {
      const latestRanking = data.rankings[data.rankings.length - 1];
      totalPositions += latestRanking.position;
      positionCount++;
    });
    
    const avgPosition = positionCount > 0 ? Math.round(totalPositions / positionCount) : 0;
    
    // Calculate change from previous week
    let totalChange = 0;
    let changeCount = 0;
    
    websiteRankings.forEach(data => {
      if (data.rankings.length >= 2) {
        const current = data.rankings[data.rankings.length - 1].position;
        const previous = data.rankings[data.rankings.length - 2].position;
        totalChange += previous - current; // Note: improving rank means position number gets smaller
        changeCount++;
      }
    });
    
    const change = changeCount > 0 ? Math.round(totalChange / changeCount) : 0;
    
    return {
      websiteId: website.id,
      domain: website.domain,
      title: undefined,
      description: undefined,
      imagePath: undefined,
      avgPosition,
      topKeyword: bestKeyword,
      topKeywordPosition: bestPosition,
      keywordCount: websiteRankings.length,
      change
    };
  });
};

export const getOverallStats = () => {
  const summaries = getRankingSummaries();
  
  const totalWebsites = mockWebsites.length;
  const totalKeywords = mockWebsites.reduce((sum, site) => sum + site.keywords.length, 0);
  
  const avgPositionTotal = summaries.reduce((sum, site) => sum + site.avgPosition, 0);
  const avgPosition = totalWebsites > 0 ? Math.round(avgPositionTotal / totalWebsites) : 0;
  
  const totalPositiveChanges = summaries.filter(s => s.change > 0).length;
  
  return {
    totalWebsites,
    totalKeywords,
    avgPosition,
    improvingWebsites: totalPositiveChanges,
    topWebsite: summaries.sort((a, b) => a.avgPosition - b.avgPosition)[0]?.domain || 'N/A'
  };
};
