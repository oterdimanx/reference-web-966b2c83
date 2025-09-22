import { supabase } from '@/integrations/supabase/client';

export interface UserKeyword {
  keyword: string;
  website_id: string;
  website_domain: string;
  website_title: string | null;
  latest_position: number | null;
  current_position: number | null;
  previous_position: number | null;
  position_change: number;
  last_updated: string | null;
  latest_ranking_date: string | null;
  ranking_confidence: string;
  ranking_url?: string;
  
  // User preferences
  preferences?: {
    difficulty_estimate: string | null;
    volume_estimate: string | null;
    notes: string | null;
    is_priority: boolean;
    tags: string[];
    group_name: string | null;
    group_color: string | null;
  };
  difficulty_estimate: string | null;
  volume_estimate: string | null;
  notes: string | null;
  is_priority: boolean;
  tags: string[];
  group_name: string | null;
  group_color: string | null;
}

interface KeywordWithPreferences extends UserKeyword {
  notes: string | null;
}

// Check if keyword has pending ranking requests
const checkKeywordInRankingRequests = async (websiteId: string, keyword: string): Promise<boolean> => {
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
    return false;
  }
};

// Get keyword dependencies
const getKeywordDependencies = async (websiteId: string, keyword: string): Promise<{
  hasRankingRequests: boolean;
  rankingRequestsCount: number;
  rankingSnapshotsCount: number;
  hasUserPreferences: boolean;
}> => {
  try {
    const [rankingRequestsData, snapshotsData, preferencesData] = await Promise.all([
      supabase
        .from('ranking_requests')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword),
      supabase
        .from('ranking_snapshots')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword),
      supabase
        .from('user_keyword_preferences')
        .select('id')
        .eq('website_id', websiteId)
        .eq('keyword', keyword)
        .limit(1)
    ]);

    return {
      hasRankingRequests: (rankingRequestsData.data || []).length > 0,
      rankingRequestsCount: (rankingRequestsData.data || []).length,
      rankingSnapshotsCount: (snapshotsData.data || []).length,
      hasUserPreferences: (preferencesData.data || []).length > 0
    };
  } catch (error) {
    console.error('Error getting keyword dependencies:', error);
    return {
      hasRankingRequests: false,
      rankingRequestsCount: 0,
      rankingSnapshotsCount: 0,
      hasUserPreferences: false
    };
  }
};

// Validate keyword operation
const validateKeywordOperation = async (websiteId: string, keyword: string, operation: 'add' | 'remove'): Promise<{
  isValid: boolean;
  reason?: string;
  dependencies?: any;
}> => {
  try {
    if (operation === 'remove') {
      const hasRankingRequests = await checkKeywordInRankingRequests(websiteId, keyword);
      if (hasRankingRequests) {
        return {
          isValid: false,
          reason: 'Cannot remove keyword with pending ranking requests'
        };
      }
    }

    const dependencies = await getKeywordDependencies(websiteId, keyword);
    
    return {
      isValid: true,
      dependencies
    };
  } catch (error) {
    console.error('Error validating keyword operation:', error);
    return {
      isValid: false,
      reason: 'Error validating operation'
    };
  }
};

// Get website keywords
const getWebsiteKeywords = async (websiteId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('websites')
      .select('keywords')
      .eq('id', websiteId)
      .single();

    if (error) throw error;
    
    const keywords = data?.keywords?.split(',').map((k: string) => k.trim()).filter(Boolean) || [];
    return keywords;
  } catch (error) {
    console.error('Error getting website keywords:', error);
    return [];
  }
};

// Add keyword to website
const addKeywordToWebsite = async (websiteId: string, keyword: string): Promise<void> => {
  try {
    const validation = await validateKeywordOperation(websiteId, keyword, 'add');
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    const currentKeywords = await getWebsiteKeywords(websiteId);
    
    if (currentKeywords.includes(keyword.toLowerCase())) {
      throw new Error('Keyword already exists for this website');
    }

    const updatedKeywords = [...currentKeywords, keyword.toLowerCase()];
    
    const { error } = await supabase
      .from('websites')
      .update({ 
        keywords: updatedKeywords.join(', '),
        keyword_count: updatedKeywords.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', websiteId);

    if (error) throw error;
  } catch (error) {
    console.error('Error adding keyword to website:', error);
    throw error;
  }
};

// Remove keyword from website
const removeKeywordFromWebsite = async (websiteId: string, keyword: string): Promise<void> => {
  try {
    const validation = await validateKeywordOperation(websiteId, keyword, 'remove');
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    const currentKeywords = await getWebsiteKeywords(websiteId);
    const updatedKeywords = currentKeywords.filter(k => k !== keyword.toLowerCase());
    
    const { error } = await supabase
      .from('websites')
      .update({ 
        keywords: updatedKeywords.join(', '),
        keyword_count: updatedKeywords.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', websiteId);

    if (error) throw error;

    await cleanupKeywordData(websiteId, keyword);
  } catch (error) {
    console.error('Error removing keyword from website:', error);
    throw error;
  }
};

// Update keyword in website
const updateKeywordInWebsite = async (websiteId: string, oldKeyword: string, newKeyword: string): Promise<void> => {
  try {
    const validation = await validateKeywordOperation(websiteId, oldKeyword, 'remove');
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    const currentKeywords = await getWebsiteKeywords(websiteId);
    
    if (currentKeywords.includes(newKeyword.toLowerCase())) {
      throw new Error('New keyword already exists for this website');
    }

    const updatedKeywords = currentKeywords.map(k => 
      k === oldKeyword.toLowerCase() ? newKeyword.toLowerCase() : k
    );
    
    const { error } = await supabase
      .from('websites')
      .update({ 
        keywords: updatedKeywords.join(', '),
        updated_at: new Date().toISOString()
      })
      .eq('id', websiteId);

    if (error) throw error;

    const { error: preferencesError } = await supabase
      .from('user_keyword_preferences')
      .update({ keyword: newKeyword.toLowerCase() })
      .eq('website_id', websiteId)
      .eq('keyword', oldKeyword.toLowerCase());

    if (preferencesError) console.error('Error updating preferences:', preferencesError);
  } catch (error) {
    console.error('Error updating keyword:', error);
    throw error;
  }
};

// Clean up keyword data
const cleanupKeywordData = async (websiteId: string, keyword: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .delete()
      .eq('website_id', websiteId)
      .eq('keyword', keyword.toLowerCase());

    if (error) console.error('Error cleaning up keyword data:', error);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Get user keywords
const getUserKeywords = async (userId: string): Promise<UserKeyword[]> => {
  try {
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select(`
        id,
        domain,
        title,
        keywords
      `)
      .eq('user_id', userId)
      .not('keywords', 'is', null)
      .not('keywords', 'eq', '');

    if (websitesError) throw websitesError;

    if (!websites || websites.length === 0) {
      return [];
    }

    const allKeywords: UserKeyword[] = [];

    for (const website of websites) {
      if (!website.keywords) continue;

      const keywords = website.keywords.split(',').map(k => k.trim()).filter(Boolean);

      for (const keyword of keywords) {
        const { data: latestRanking } = await supabase
          .from('ranking_snapshots')
          .select('position, created_at, ranking_confidence')
          .eq('website_id', website.id)
          .eq('keyword', keyword)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: previousRanking } = await supabase
          .from('ranking_snapshots')
          .select('position')
          .eq('website_id', website.id)
          .eq('keyword', keyword)
          .order('created_at', { ascending: false })
          .offset(1)
          .limit(1)
          .single();

        const { data: preferences } = await supabase
          .from('user_keyword_preferences')
          .select('*')
          .eq('user_id', userId)
          .eq('website_id', website.id)
          .eq('keyword', keyword)
          .single();

        const userKeyword: UserKeyword = {
          keyword,
          website_id: website.id,
          website_domain: website.domain,
          website_title: website.title,
          latest_position: latestRanking?.position || null,
          current_position: latestRanking?.position || null,
          previous_position: previousRanking?.position || null,
          position_change: latestRanking?.position && previousRanking?.position 
            ? previousRanking.position - latestRanking.position 
            : 0,
          last_updated: latestRanking?.created_at || null,
          latest_ranking_date: latestRanking?.created_at || null,
          ranking_confidence: latestRanking?.ranking_confidence || 'high',
          
          // User preferences (both formats for compatibility)
          preferences: preferences ? {
            difficulty_estimate: preferences.difficulty_estimate || null,
            volume_estimate: preferences.volume_estimate || null,
            notes: preferences.notes || null,
            is_priority: preferences.is_priority || false,
            tags: preferences.tags || [],
            group_name: preferences.group_name || null,
            group_color: preferences.group_color || null
          } : undefined,
          difficulty_estimate: preferences?.difficulty_estimate || null,
          volume_estimate: preferences?.volume_estimate || null,
          notes: preferences?.notes || null,
          is_priority: preferences?.is_priority || false,
          tags: preferences?.tags || [],
          group_name: preferences?.group_name || null,
          group_color: preferences?.group_color || null
        };

        allKeywords.push(userKeyword);
      }
    }

    return allKeywords.sort((a, b) => {
      if (a.is_priority && !b.is_priority) return -1;
      if (!a.is_priority && b.is_priority) return 1;
      return a.keyword.localeCompare(b.keyword);
    });
  } catch (error) {
    console.error('Error getting user keywords:', error);
    throw error;
  }
};

// Get keyword history
const getKeywordHistory = async (websiteId: string, keyword: string, limit: number = 30): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('*')
      .eq('website_id', websiteId)
      .eq('keyword', keyword)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting keyword history:', error);
    return [];
  }
};

// Update keyword preferences
const updateKeywordPreferences = async (
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
): Promise<void> => {
  try {
    console.log('Updating keyword preferences:', { userId, websiteId, keyword, preferences });
    
    const { error } = await supabase
      .from('user_keyword_preferences')
      .upsert({
        user_id: userId,
        website_id: websiteId,
        keyword,
        ...preferences
      }, { 
        onConflict: 'user_id,website_id,keyword'
      });

    if (error) {
      console.error('Database error in updateKeywordPreferences:', error);
      throw error;
    }
    
    console.log('Successfully updated keyword preferences');
  } catch (error) {
    console.error('Error updating keyword preferences:', error);
    throw error;
  }
};

// Get user tags
const getUserTags = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'is', null);

    if (error) throw error;

    const allTags = new Set<string>();
    data?.forEach(row => {
      row.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Error getting user tags:', error);
    return [];
  }
};

// Get user groups
const getUserGroups = async (userId: string): Promise<{name: string, color?: string}[]> => {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('group_name, group_color')
      .eq('user_id', userId)
      .not('group_name', 'is', null);

    if (error) throw error;

    const groupsMap = new Map();
    data?.forEach(row => {
      if (row.group_name && !groupsMap.has(row.group_name)) {
        groupsMap.set(row.group_name, {
          name: row.group_name,
          color: row.group_color
        });
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
};

// Get keywords by group
const getKeywordsByGroup = async (userId: string, groupName: string): Promise<UserKeyword[]> => {
  try {
    const allKeywords = await getUserKeywords(userId);
    return allKeywords.filter(keyword => keyword.group_name === groupName);
  } catch (error) {
    console.error('Error getting keywords by group:', error);
    return [];
  }
};

// Get keywords by tag
const getKeywordsByTag = async (userId: string, tag: string): Promise<UserKeyword[]> => {
  try {
    const allKeywords = await getUserKeywords(userId);
    return allKeywords.filter(keyword => keyword.tags?.includes(tag));
  } catch (error) {
    console.error('Error getting keywords by tag:', error);
    return [];
  }
};

// Bulk update keyword groups
const bulkUpdateKeywordGroups = async (
  userId: string,
  updates: { websiteId: string; keyword: string; groupName?: string; groupColor?: string }[]
): Promise<void> => {
  try {
    const updatePromises = updates.map(({ websiteId, keyword, groupName, groupColor }) =>
      updateKeywordPreferences(userId, websiteId, keyword, { 
        group_name: groupName,
        group_color: groupColor 
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error bulk updating keyword groups:', error);
    throw error;
  }
};

// Bulk update keyword tags
const bulkUpdateKeywordTags = async (
  userId: string,
  updates: { websiteId: string; keyword: string; tags: string[] }[]
): Promise<void> => {
  try {
    console.log('Bulk updating tags for', updates.length, 'keywords:', updates);
    
    const updatePromises = updates.map(({ websiteId, keyword, tags }) =>
      updateKeywordPreferences(userId, websiteId, keyword, { tags })
    );

    await Promise.all(updatePromises);
    console.log('Successfully bulk updated keyword tags');
  } catch (error) {
    console.error('Error bulk updating keyword tags:', error);
    throw error;
  }
};

// Enhanced tag management functions
const renameUserTag = async (userId: string, oldTag: string, newTag: string): Promise<void> => {
  try {
    const { data: preferences, error: fetchError } = await supabase
      .from('user_keyword_preferences')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [oldTag]);

    if (fetchError) throw fetchError;

    const updatePromises = preferences?.map(pref => {
      const updatedTags = pref.tags?.map((tag: string) => 
        tag === oldTag ? newTag : tag
      ) || [];
      
      return supabase
        .from('user_keyword_preferences')
        .update({ tags: updatedTags })
        .eq('id', pref.id);
    });

    if (updatePromises) {
      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Error renaming tag:', error);
    throw error;
  }
};

const deleteUserTag = async (userId: string, tagName: string): Promise<void> => {
  try {
    const { data: preferences, error: fetchError } = await supabase
      .from('user_keyword_preferences')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [tagName]);

    if (fetchError) throw fetchError;

    const updatePromises = preferences?.map(pref => {
      const updatedTags = pref.tags?.filter((tag: string) => tag !== tagName) || [];
      
      return supabase
        .from('user_keyword_preferences')
        .update({ tags: updatedTags })
        .eq('id', pref.id);
    });

    if (updatePromises) {
      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

const mergeUserTags = async (userId: string, sourceTags: string[], targetTag: string): Promise<void> => {
  try {
    const { data: preferences, error: fetchError } = await supabase
      .from('user_keyword_preferences')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    const updatePromises = preferences?.map(pref => {
      if (!pref.tags) return null;
      
      const hasSourceTag = sourceTags.some(tag => pref.tags.includes(tag));
      if (!hasSourceTag) return null;

      const updatedTags = pref.tags
        .filter((tag: string) => !sourceTags.includes(tag))
        .concat([targetTag]);
      
      return supabase
        .from('user_keyword_preferences')
        .update({ tags: [...new Set(updatedTags)] })
        .eq('id', pref.id);
    }).filter(Boolean);

    if (updatePromises) {
      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Error merging tags:', error);
    throw error;
  }
};

// Enhanced group management functions
const renameUserGroup = async (userId: string, oldName: string, newName: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .update({ group_name: newName })
      .eq('user_id', userId)
      .eq('group_name', oldName);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error renaming group:', error);
    throw error;
  }
};

const deleteUserGroup = async (userId: string, groupName: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .update({ group_name: null, group_color: null })
      .eq('user_id', userId)
      .eq('group_name', groupName);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

const mergeUserGroups = async (userId: string, sourceGroups: string[], targetGroup: string, targetColor?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_keyword_preferences')
      .update({ 
        group_name: targetGroup,
        group_color: targetColor 
      })
      .eq('user_id', userId)
      .in('group_name', sourceGroups);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error merging groups:', error);
    throw error;
  }
};

// Get keyword counts for tags and groups
const getTagKeywordCounts = async (userId: string): Promise<{[tag: string]: number}> => {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'is', null);

    if (error) throw error;

    const tagCounts: {[tag: string]: number} = {};
    data?.forEach(row => {
      row.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return tagCounts;
  } catch (error) {
    console.error('Error getting tag counts:', error);
    return {};
  }
};

const getGroupKeywordCounts = async (userId: string): Promise<{[group: string]: number}> => {
  try {
    const { data, error } = await supabase
      .from('user_keyword_preferences')
      .select('group_name')
      .eq('user_id', userId)
      .not('group_name', 'is', null);

    if (error) throw error;

    const groupCounts: {[group: string]: number} = {};
    data?.forEach(row => {
      if (row.group_name) {
        groupCounts[row.group_name] = (groupCounts[row.group_name] || 0) + 1;
      }
    });

    return groupCounts;
  } catch (error) {
    console.error('Error getting group counts:', error);
    return {};
  }
};

export const keywordService = {
  checkKeywordInRankingRequests,
  getKeywordDependencies,
  validateKeywordOperation,
  getWebsiteKeywords,
  addKeywordToWebsite,
  removeKeywordFromWebsite,
  updateKeywordInWebsite,
  cleanupKeywordData,
  getUserKeywords,
  getKeywordHistory,
  updateKeywordPreferences,
  getUserTags,
  getUserGroups,
  getKeywordsByGroup,
  getKeywordsByTag,
  bulkUpdateKeywordGroups,
  bulkUpdateKeywordTags,
  // Enhanced management functions
  renameUserTag,
  deleteUserTag,
  mergeUserTags,
  renameUserGroup,
  deleteUserGroup,
  mergeUserGroups,
  getTagKeywordCounts,
  getGroupKeywordCounts
};