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
  preferences?: {
    tags?: string[];
    group_name?: string;
    group_color?: string;
    notes?: string;
  };
}

export interface KeywordWithPreferences extends UserKeyword {
  notes: string | null;
}

export const keywordService = {
  async checkKeywordInRankingRequests(websiteId: string, keyword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ranking_requests')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .in('status', ['pending', 'processing'])
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking keyword in ranking requests:', error);
      throw error;
    }
  },

  async getKeywordDependencies(websiteId: string, keyword: string): Promise<{
    hasRankingRequests: boolean;
    rankingRequestsCount: number;
    rankingSnapshotsCount: number;
    hasUserPreferences: boolean;
  }> {
    try {
      // Check ranking requests
      const { data: rankingRequests, error: requestsError } = await supabase
        .from('ranking_requests')
        .select('id, status')
        .eq('website_id', websiteId)
        .eq('keyword', keyword);

      if (requestsError) throw requestsError;

      // Check ranking snapshots
      const { data: snapshots, error: snapshotsError } = await supabase
        .from('ranking_snapshots')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword);

      if (snapshotsError) throw snapshotsError;

      // Check user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_keyword_preferences')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword);

      if (preferencesError) throw preferencesError;

      const pendingRequests = rankingRequests?.filter(req => 
        req.status === 'pending' || req.status === 'processing'
      ) || [];

      return {
        hasRankingRequests: pendingRequests.length > 0,
        rankingRequestsCount: rankingRequests?.length || 0,
        rankingSnapshotsCount: snapshots?.length || 0,
        hasUserPreferences: preferences && preferences.length > 0
      };
    } catch (error) {
      console.error('Error getting keyword dependencies:', error);
      throw error;
    }
  },

  async validateKeywordOperation(websiteId: string, keyword: string, operation: 'add' | 'remove'): Promise<{
    isValid: boolean;
    reason?: string;
    dependencies?: any;
  }> {
    try {
      if (operation === 'remove') {
        const dependencies = await this.getKeywordDependencies(websiteId, keyword);
        
        if (dependencies.hasRankingRequests) {
          return {
            isValid: false,
            reason: 'Cannot remove keyword with pending or processing ranking requests',
            dependencies
          };
        }
      }

      // Additional validation for 'add' operation
      if (operation === 'add') {
        const currentKeywords = await this.getWebsiteKeywords(websiteId);
        if (currentKeywords.includes(keyword.trim())) {
          return {
            isValid: false,
            reason: 'Keyword already exists for this website'
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating keyword operation:', error);
      return {
        isValid: false,
        reason: 'Error validating operation'
      };
    }
  },

  async getWebsiteKeywords(websiteId: string): Promise<string[]> {
    try {
      const { data: website, error } = await supabase
        .from('websites')
        .select('keywords')
        .eq('id', websiteId)
        .maybeSingle();

      if (error) throw error;
      
      if (!website?.keywords) return [];
      
      return website.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
    } catch (error) {
      console.error('Error getting website keywords:', error);
      throw error;
    }
  },

  async addKeywordToWebsite(websiteId: string, keyword: string): Promise<void> {
    try {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) {
        throw new Error('Keyword cannot be empty');
      }

      // Validate the operation
      const validation = await this.validateKeywordOperation(websiteId, trimmedKeyword, 'add');
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      // Get current keywords
      const currentKeywords = await this.getWebsiteKeywords(websiteId);
      
      // Add the new keyword
      const updatedKeywords = [...currentKeywords, trimmedKeyword];
      const keywordsString = updatedKeywords.join(', ');

      // Update the website
      const { error } = await supabase
        .from('websites')
        .update({ 
          keywords: keywordsString,
          updated_at: new Date().toISOString()
        })
        .eq('id', websiteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding keyword to website:', error);
      throw error;
    }
  },

  async removeKeywordFromWebsite(websiteId: string, keyword: string): Promise<void> {
    try {
      const trimmedKeyword = keyword.trim();

      // Validate the operation
      const validation = await this.validateKeywordOperation(websiteId, trimmedKeyword, 'remove');
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      // Get current keywords
      const currentKeywords = await this.getWebsiteKeywords(websiteId);
      
      // Remove the keyword
      const updatedKeywords = currentKeywords.filter(k => k !== trimmedKeyword);
      const keywordsString = updatedKeywords.join(', ');

      // Update the website
      const { error: updateError } = await supabase
        .from('websites')
        .update({ 
          keywords: keywordsString,
          updated_at: new Date().toISOString()
        })
        .eq('id', websiteId);

      if (updateError) throw updateError;

      // Clean up related data
      await this.cleanupKeywordData(websiteId, trimmedKeyword);
    } catch (error) {
      console.error('Error removing keyword from website:', error);
      throw error;
    }
  },

  async cleanupKeywordData(websiteId: string, keyword: string): Promise<void> {
    try {
      // Remove user preferences for this keyword
      const { error: preferencesError } = await supabase
        .from('user_keyword_preferences')
        .delete()
        .eq('website_id', websiteId)
        .eq('keyword', keyword);

      if (preferencesError) {
        console.error('Error cleaning up keyword preferences:', preferencesError);
      }

      // Note: We don't delete ranking_snapshots as they are historical data
      // and should be preserved for analytics purposes
    } catch (error) {
      console.error('Error cleaning up keyword data:', error);
      // Don't throw here as the main operation succeeded
    }
  },

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
            .maybeSingle();

          // Get previous ranking for change calculation
          const { data: previousRanking } = await supabase
            .from('ranking_snapshots')
            .select('position')
            .eq('website_id', website.id)
            .eq('keyword', keyword)
            .order('snapshot_date', { ascending: false })
            .range(1, 1)
            .maybeSingle();

          // Get user preferences for this keyword
          const { data: preferences } = await supabase
            .from('user_keyword_preferences')
            .select('difficulty_estimate, volume_estimate, is_priority, tags, group_name, group_color, notes')
            .eq('user_id', userId)
            .eq('website_id', website.id)
            .eq('keyword', keyword)
            .maybeSingle();

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
            ranking_url: latestRanking?.url || null,
            preferences: preferences ? {
              tags: preferences.tags || [],
              group_name: preferences.group_name || undefined,
              group_color: preferences.group_color || undefined,
              notes: preferences.notes || undefined
            } : undefined
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

  async updateKeywordInWebsite(websiteId: string, oldKeyword: string, newKeyword: string): Promise<void> {
    try {
      const trimmedOldKeyword = oldKeyword.trim();
      const trimmedNewKeyword = newKeyword.trim();

      if (!trimmedNewKeyword) {
        throw new Error('New keyword cannot be empty');
      }

      if (trimmedOldKeyword === trimmedNewKeyword) {
        return; // No change needed
      }

      // Validate that old keyword can be modified (no pending ranking requests)
      const validation = await this.validateKeywordOperation(websiteId, trimmedOldKeyword, 'remove');
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      // Validate that new keyword doesn't already exist
      const currentKeywords = await this.getWebsiteKeywords(websiteId);
      if (currentKeywords.includes(trimmedNewKeyword)) {
        throw new Error('New keyword already exists for this website');
      }

      // Update keywords string by replacing old with new
      const updatedKeywords = currentKeywords.map(k => 
        k === trimmedOldKeyword ? trimmedNewKeyword : k
      );
      const keywordsString = updatedKeywords.join(', ');

      // Update the website
      const { error: updateError } = await supabase
        .from('websites')
        .update({ 
          keywords: keywordsString,
          updated_at: new Date().toISOString()
        })
        .eq('id', websiteId);

      if (updateError) throw updateError;

      // Update user preferences to reference the new keyword name
      const { error: preferencesError } = await supabase
        .from('user_keyword_preferences')
        .update({ keyword: trimmedNewKeyword })
        .eq('website_id', websiteId)
        .eq('keyword', trimmedOldKeyword);

      if (preferencesError) {
        console.error('Error updating keyword preferences:', preferencesError);
        // Don't throw here as the main operation succeeded
      }
    } catch (error) {
      console.error('Error updating keyword in website:', error);
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
      tags?: string[];
      group_name?: string;
      group_color?: string;
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
  },

  // Tag management functions
  async getUserTags(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_keyword_preferences')
        .select('tags')
        .eq('user_id', userId)
        .not('tags', 'is', null);

      if (error) throw error;

      const allTags = new Set<string>();
      data?.forEach(row => {
        if (row.tags) {
          row.tags.forEach((tag: string) => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Error fetching user tags:', error);
      throw error;
    }
  },

  async getUserGroups(userId: string): Promise<{name: string, color?: string}[]> {
    try {
      const { data, error } = await supabase
        .from('user_keyword_preferences')
        .select('group_name, group_color')
        .eq('user_id', userId)
        .not('group_name', 'is', null);

      if (error) throw error;

      const groupsMap = new Map<string, string | undefined>();
      data?.forEach(row => {
        if (row.group_name) {
          groupsMap.set(row.group_name, row.group_color);
        }
      });

      return Array.from(groupsMap.entries()).map(([name, color]) => ({
        name,
        color
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  },

  async getKeywordsByGroup(userId: string, groupName: string): Promise<UserKeyword[]> {
    try {
      const userKeywords = await keywordService.getUserKeywords(userId);
      return userKeywords.filter(keyword => keyword.preferences?.group_name === groupName);
    } catch (error) {
      console.error('Error fetching keywords by group:', error);
      throw error;
    }
  },

  async getKeywordsByTag(userId: string, tag: string): Promise<UserKeyword[]> {
    try {
      const userKeywords = await keywordService.getUserKeywords(userId);
      return userKeywords.filter(keyword => 
        keyword.preferences?.tags?.includes(tag)
      );
    } catch (error) {
      console.error('Error fetching keywords by tag:', error);
      throw error;
    }
  },

  async bulkUpdateKeywordGroups(
    userId: string,
    updates: { websiteId: string; keyword: string; groupName?: string; groupColor?: string }[]
  ): Promise<void> {
    try {
      const updatePromises = updates.map(({ websiteId, keyword, groupName, groupColor }) =>
        keywordService.updateKeywordPreferences(userId, websiteId, keyword, {
          group_name: groupName,
          group_color: groupColor
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error bulk updating keyword groups:', error);
      throw error;
    }
  },

  async bulkUpdateKeywordTags(
    userId: string,
    updates: { websiteId: string; keyword: string; tags: string[] }[]
  ): Promise<void> {
    try {
      const updatePromises = updates.map(({ websiteId, keyword, tags }) =>
        keywordService.updateKeywordPreferences(userId, websiteId, keyword, { tags })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error bulk updating keyword tags:', error);
      throw error;
    }
  }
};