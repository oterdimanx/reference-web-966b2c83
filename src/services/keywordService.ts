import { supabase } from '@/integrations/supabase/client';

export interface UserKeyword {
  keyword: string;
  website_id: string;
  website_domain: string;
  latest_position: number | null;
  latest_ranking_date: string | null;
  difficulty_estimate: string | null;
  volume_estimate: string | null;
  is_priority: boolean;
  position_change: number | null;
  ranking_url: string | null;
}

export interface KeywordWithPreferences extends UserKeyword {
  notes: string | null;
}

export const keywordService = {
  async getUserKeywords(userId: string): Promise<UserKeyword[]> {
    try {
      // Get user's websites with their keywords
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('id, domain, keywords')
        .eq('user_id', userId)
        .not('keywords', 'is', null)
        .not('keywords', 'eq', '');

      if (websitesError) throw websitesError;
      if (!websites || websites.length === 0) return [];

      // Parse keywords and get latest rankings
      const keywordPromises = websites.flatMap(website => {
        if (!website.keywords) return [];
        
        const keywords = website.keywords.split(',').map(k => k.trim()).filter(k => k);
        return keywords.map(async keyword => {
          // Get latest ranking for this keyword
          const { data: latestRanking } = await supabase
            .from('ranking_snapshots')
            .select('position, snapshot_date, url')
            .eq('website_id', website.id)
            .eq('keyword', keyword)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single();

          // Get previous ranking for change calculation
          const { data: previousRanking } = await supabase
            .from('ranking_snapshots')
            .select('position')
            .eq('website_id', website.id)
            .eq('keyword', keyword)
            .order('snapshot_date', { ascending: false })
            .range(1, 1)
            .single();

          // Get user preferences for this keyword
          const { data: preferences } = await supabase
            .from('user_keyword_preferences')
            .select('difficulty_estimate, volume_estimate, is_priority')
            .eq('user_id', userId)
            .eq('website_id', website.id)
            .eq('keyword', keyword)
            .single();

          const currentPosition = latestRanking?.position || null;
          const previousPosition = previousRanking?.position || null;
          let positionChange = null;

          if (currentPosition && previousPosition) {
            positionChange = previousPosition - currentPosition; // Positive = improvement (lower position number)
          }

          return {
            keyword,
            website_id: website.id,
            website_domain: website.domain,
            latest_position: currentPosition,
            latest_ranking_date: latestRanking?.snapshot_date || null,
            difficulty_estimate: preferences?.difficulty_estimate || null,
            volume_estimate: preferences?.volume_estimate || 'Medium',
            is_priority: preferences?.is_priority || false,
            position_change: positionChange,
            ranking_url: latestRanking?.url || null
          };
        });
      });

      const keywords = await Promise.all(keywordPromises);
      return keywords.sort((a, b) => {
        // Priority keywords first, then by latest position (nulls last)
        if (a.is_priority && !b.is_priority) return -1;
        if (!a.is_priority && b.is_priority) return 1;
        if (a.latest_position === null && b.latest_position !== null) return 1;
        if (a.latest_position !== null && b.latest_position === null) return -1;
        if (a.latest_position !== null && b.latest_position !== null) {
          return a.latest_position - b.latest_position;
        }
        return a.keyword.localeCompare(b.keyword);
      });
    } catch (error) {
      console.error('Error fetching user keywords:', error);
      throw error;
    }
  },

  async getKeywordHistory(websiteId: string, keyword: string, limit = 30): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ranking_snapshots')
        .select('position, snapshot_date, search_engine')
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .order('snapshot_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching keyword history:', error);
      throw error;
    }
  },

  async updateKeywordPreferences(
    userId: string,
    websiteId: string,
    keyword: string,
    preferences: {
      difficulty_estimate?: string;
      volume_estimate?: string;
      notes?: string;
      is_priority?: boolean;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_keyword_preferences')
        .upsert({
          user_id: userId,
          website_id: websiteId,
          keyword,
          ...preferences
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating keyword preferences:', error);
      throw error;
    }
  }
};