
import { supabase } from '@/integrations/supabase/client';
import { RankingSummary } from '@/lib/mockData';

// Map RankingSummary to database structure and back
export const mapToDbWebsite = (website: RankingSummary) => {
  return {
    id: website.websiteId,
    domain: website.domain,
    avg_position: website.avgPosition,
    position_change: website.change,
    keyword_count: website.keywordCount,
    top_keyword: website.topKeyword || 'N/A',
    top_keyword_position: website.topKeywordPosition || 1,
  };
};

export const mapFromDbWebsite = (dbWebsite: any): RankingSummary => {
  return {
    websiteId: dbWebsite.id,
    domain: dbWebsite.domain,
    avgPosition: dbWebsite.avg_position,
    change: dbWebsite.position_change,
    keywordCount: dbWebsite.keyword_count,
    topKeyword: dbWebsite.top_keyword || 'N/A',
    topKeywordPosition: dbWebsite.top_keyword_position || 1,
  };
};

// Save a website to the database
export const saveWebsite = async (website: RankingSummary): Promise<RankingSummary | null> => {
  try {
    const { data, error } = await supabase
      .from('websites')
      .insert(mapToDbWebsite(website))
      .select()
      .single();
      
    if (error) {
      console.error('Error saving website:', error);
      return null;
    }
    
    return mapFromDbWebsite(data);
  } catch (error) {
    console.error('Exception saving website:', error);
    return null;
  }
};

// Get all websites for the current user
export const getUserWebsites = async (): Promise<RankingSummary[]> => {
  try {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching websites:', error);
      return [];
    }
    
    return data.map(mapFromDbWebsite);
  } catch (error) {
    console.error('Exception fetching websites:', error);
    return [];
  }
};
