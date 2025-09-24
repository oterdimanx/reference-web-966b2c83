
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
  searchDepth: number;
  rankingConfidence: string;
  isPriorityKeyword: boolean;
}

export interface KeywordPreference {
  id: string;
  userId: string;
  websiteId: string;
  keyword: string;
  isPriority: boolean;
  deepSearchEnabled: boolean;
  lastDeepSearchAt: string | null;
  tags: string[] | null;
  groupName: string | null;
  groupColor: string | null;
  difficultyEstimate: string | null;
  volumeEstimate: string | null;
  notes: string | null;
}

// Priority keyword management
export const toggleKeywordPriority = async (websiteId: string, keyword: string, isPriority: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .upsert({
        website_id: websiteId,
        keyword: keyword,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        is_priority: isPriority,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,website_id,keyword'
      });

    if (error) {
      console.error('Error updating keyword priority:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating keyword priority:', error);
    return false;
  }
};

export const toggleDeepSearch = async (websiteId: string, keyword: string, enabled: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .upsert({
        website_id: websiteId,
        keyword: keyword,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        deep_search_enabled: enabled,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,website_id,keyword'
      });

    if (error) {
      console.error('Error updating deep search setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating deep search setting:', error);
    return false;
  }
};

export const getKeywordPreferences = async (websiteId: string): Promise<KeywordPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('*')
      .eq('website_id', websiteId);

    if (error) {
      console.error('Error fetching keyword preferences:', error);
      return [];
    }

    return data.map(pref => ({
      id: pref.id,
      userId: pref.user_id,
      websiteId: pref.website_id,
      keyword: pref.keyword,
      isPriority: pref.is_priority || false,
      deepSearchEnabled: pref.deep_search_enabled || false,
      lastDeepSearchAt: pref.last_deep_search_at,
      tags: pref.tags,
      groupName: pref.group_name,
      groupColor: pref.group_color,
      difficultyEstimate: pref.difficulty_estimate,
      volumeEstimate: pref.volume_estimate,
      notes: pref.notes,
    }));
  } catch (error) {
    console.error('Exception fetching keyword preferences:', error);
    return [];
  }
};

// Trigger deep search for specific keyword
export const triggerDeepSearch = async (websiteId: string, keyword: string): Promise<boolean> => {
  try {
    // Enable deep search for this keyword temporarily
    await toggleDeepSearch(websiteId, keyword, true);
    
    // Trigger the ranking check
    const result = await triggerRankingCheck(websiteId, keyword);
    
    return result;
  } catch (error) {
    console.error('Exception triggering deep search:', error);
    return false;
  }
};

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
      searchDepth: snapshot.search_depth || 100,
      rankingConfidence: snapshot.ranking_confidence || 'unknown',
      isPriorityKeyword: snapshot.is_priority_keyword || false,
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
      searchDepth: snapshot.search_depth || 100,
      rankingConfidence: snapshot.ranking_confidence || 'unknown',
      isPriorityKeyword: snapshot.is_priority_keyword || false,
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
    
    // First, get the active keywords for each website (same as keywords page)
    const { data: websiteData, error: websiteError } = await supabase
      .from('websites')
      .select('id, keywords')
      .in('id', websiteIds)
      .not('keywords', 'is', null)
      .not('keywords', 'eq', '');

    if (websiteError) {
      console.error('Error fetching website keywords:', websiteError);
      return [];
    }

    // Create a map of website -> active keywords
    const activeKeywordsMap: { [websiteId: string]: string[] } = {};
    websiteData.forEach(website => {
      if (website.keywords) {
        activeKeywordsMap[website.id] = website.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
    });

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
      
      // Only include keywords that are still active in the website's keyword list
      const activeKeywords = activeKeywordsMap[websiteId];
      if (!activeKeywords || !activeKeywords.includes(keyword)) {
        return; // Skip this keyword as it's been removed from the user's interface
      }
      
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
        searchDepth: snapshot.search_depth || 100,
        rankingConfidence: snapshot.ranking_confidence || 'unknown',
        isPriorityKeyword: snapshot.is_priority_keyword || false,
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

// Get websites that have ranking data
export const getWebsitesWithRankingData = async (websites: { websiteId: string; domain: string }[]): Promise<{ websiteId: string; domain: string }[]> => {
  if (!websites.length) return [];
  
  try {
    const websiteIds = websites.map(w => w.websiteId);
    
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('website_id')
      .in('website_id', websiteIds);

    if (error) {
      console.error('Error fetching websites with ranking data:', error);
      return [];
    }

    // Get unique website IDs that have ranking data
    const websiteIdsWithData = [...new Set(data.map(snapshot => snapshot.website_id))];
    
    // Return websites that have ranking data
    return websites.filter(website => websiteIdsWithData.includes(website.websiteId));
  } catch (error) {
    console.error('Exception fetching websites with ranking data:', error);
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
      searchDepth: snapshot.search_depth || 100,
      rankingConfidence: snapshot.ranking_confidence || 'unknown',
      isPriorityKeyword: snapshot.is_priority_keyword || false,
    }));
  } catch (error) {
    console.error('Exception fetching keyword ranking history:', error);
    return [];
  }
};
