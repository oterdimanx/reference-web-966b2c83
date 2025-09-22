
import { supabase } from '@/integrations/supabase/client';

export interface RankingSnapshot {
  id: string;
  websiteId: string;
  keyword: string;
  searchEngine: string;
  position: number | null;
  url: string | null;
  title: string | null;
  description: string | null;
  snapshotDate: string;
  createdAt: string;
}

// Fetch rankings for a specific website
export const fetchWebsiteRankings = async (websiteId: string): Promise<RankingSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('*')
      .eq('website_id', websiteId)
      .order('snapshot_date', { ascending: false })
      .order('keyword', { ascending: true });

    if (error) {
      console.error('Error fetching website rankings:', error);
      return [];
    }

    return data.map(snapshot => ({
      id: snapshot.id,
      websiteId: snapshot.website_id,
      keyword: snapshot.keyword,
      searchEngine: snapshot.search_engine,
      position: snapshot.position,
      url: snapshot.url,
      title: snapshot.title,
      description: snapshot.description,
      snapshotDate: snapshot.snapshot_date,
      createdAt: snapshot.created_at,
    }));
  } catch (error) {
    console.error('Exception fetching website rankings:', error);
    return [];
  }
};

// Get latest rankings for a website
export const getLatestRankings = async (websiteId: string): Promise<RankingSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('*')
      .eq('website_id', websiteId)
      .order('snapshot_date', { ascending: false })
      .limit(50); // Get latest 50 rankings

    if (error) {
      console.error('Error fetching latest rankings:', error);
      return [];
    }

    return data.map(snapshot => ({
      id: snapshot.id,
      websiteId: snapshot.website_id,
      keyword: snapshot.keyword,
      searchEngine: snapshot.search_engine,
      position: snapshot.position,
      url: snapshot.url,
      title: snapshot.title,
      description: snapshot.description,
      snapshotDate: snapshot.snapshot_date,
      createdAt: snapshot.created_at,
    }));
  } catch (error) {
    console.error('Exception fetching latest rankings:', error);
    return [];
  }
};

// Trigger manual ranking check for a website
export const triggerRankingCheck = async (websiteId: string, specificKeyword?: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-rankings', {
      body: { 
        websiteId,
        specificKeyword
      }
    });

    if (error) {
      console.error('Error triggering ranking check:', error);
      return false;
    }

    console.log('Ranking check triggered successfully:', data);
    return true;
  } catch (error) {
    console.error('Exception triggering ranking check:', error);
    return false;
  }
};

// Transform database ranking snapshots to dashboard chart format
export const getDashboardRankingData = async (websites: { websiteId: string; domain: string }[]): Promise<import('@/lib/mockData').RankingData[]> => {
  if (!websites.length) return [];
  
  try {
    // Get all website IDs
    const websiteIds = websites.map(w => w.websiteId);
    
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('*')
      .in('website_id', websiteIds)
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error('Error fetching dashboard ranking data:', error);
      return [];
    }

    // Group by website then keyword to avoid issues with UUID hyphens
    const groupedByWebsite: { [websiteId: string]: { [keyword: string]: RankingSnapshot[] } } = {};
    
    data.forEach(snapshot => {
      const websiteId = snapshot.website_id as string;
      const keyword = snapshot.keyword as string;
      if (!groupedByWebsite[websiteId]) {
        groupedByWebsite[websiteId] = {};
      }
      if (!groupedByWebsite[websiteId][keyword]) {
        groupedByWebsite[websiteId][keyword] = [];
      }
      groupedByWebsite[websiteId][keyword].push({
        id: snapshot.id,
        websiteId: snapshot.website_id,
        keyword: snapshot.keyword,
        searchEngine: snapshot.search_engine,
        position: snapshot.position,
        url: snapshot.url,
        title: snapshot.title,
        description: snapshot.description,
        snapshotDate: snapshot.snapshot_date,
        createdAt: snapshot.created_at,
      });
    });

    // Transform to RankingData format
    const result = Object.entries(groupedByWebsite).flatMap(([websiteId, keywordsMap]) =>
      Object.entries(keywordsMap).map(([keyword, snapshots]) => ({
        websiteId,
        keyword,
        rankings: snapshots
          .map(s => ({
            date: s.snapshotDate,
            position: s.position ?? 101 // Map null positions to 101 (not in top 100)
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }))
    );

    // Only include keywords with actual ranking data points (including 101)
    return result.filter(d => d.rankings.length > 0);
  } catch (error) {
    console.error('Exception fetching dashboard ranking data:', error);
    return [];
  }
};

// Get ranking history for a specific keyword
export const getKeywordRankingHistory = async (websiteId: string, keyword: string, searchEngine: string = 'google'): Promise<RankingSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('*')
      .eq('website_id', websiteId)
      .eq('keyword', keyword)
      .eq('search_engine', searchEngine)
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error('Error fetching keyword ranking history:', error);
      return [];
    }

    return data.map(snapshot => ({
      id: snapshot.id,
      websiteId: snapshot.website_id,
      keyword: snapshot.keyword,
      searchEngine: snapshot.search_engine,
      position: snapshot.position,
      url: snapshot.url,
      title: snapshot.title,
      description: snapshot.description,
      snapshotDate: snapshot.snapshot_date,
      createdAt: snapshot.created_at,
    }));
  } catch (error) {
    console.error('Exception fetching keyword ranking history:', error);
    return [];
  }
};
