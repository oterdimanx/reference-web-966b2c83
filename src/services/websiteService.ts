import { supabase } from '@/integrations/supabase/client';
import { RankingSummary } from '@/lib/mockData';

// Extended website interface with additional fields
export interface DetailedWebsite extends RankingSummary {
  title?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  phonePrefix?: string;
  phoneNumber?: string;
  reciprocalLink?: string | null;
  pricingId?: string;
  pricingTitle?: string;
  pricingPrice?: number;
  imagePath?: string | null;
  keywords?: string; // Add keywords field
}

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

// Map detailed website data to database structure
export const mapToDbDetailedWebsite = (website: DetailedWebsite) => {
  return {
    id: website.websiteId,
    domain: website.domain,
    avg_position: website.avgPosition,
    position_change: website.change,
    keyword_count: website.keywordCount,
    top_keyword: website.topKeyword || 'N/A',
    top_keyword_position: website.topKeywordPosition || 1,
    title: website.title,
    description: website.description,
    contact_name: website.contactName,
    contact_email: website.contactEmail,
    phone_prefix: website.phonePrefix,
    phone_number: website.phoneNumber,
    reciprocal_link: website.reciprocalLink,
    pricing_id: website.pricingId,
    image_path: website.imagePath,
    keywords: website.keywords // Add keywords field mapping
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

// Map from database to detailed website
export const mapFromDbDetailedWebsite = (dbWebsite: any): DetailedWebsite => {
  return {
    ...mapFromDbWebsite(dbWebsite),
    title: dbWebsite.title,
    description: dbWebsite.description,
    contactName: dbWebsite.contact_name,
    contactEmail: dbWebsite.contact_email,
    phonePrefix: dbWebsite.phone_prefix,
    phoneNumber: dbWebsite.phone_number,
    reciprocalLink: dbWebsite.reciprocal_link,
    pricingId: dbWebsite.pricing_id,
    imagePath: dbWebsite.image_path,
    keywords: dbWebsite.keywords // Add keywords field mapping
  };
};

// Save a website to the database
export const saveWebsite = async (website: RankingSummary): Promise<RankingSummary | null> => {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const websiteData = {
      ...mapToDbWebsite(website),
      user_id: user.id // Set the user_id to the current authenticated user
    };
    
    const { data, error } = await supabase
      .from('websites')
      .insert(websiteData)
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

// Save a detailed website to the database
export const saveWebsiteDetailed = async (website: DetailedWebsite): Promise<DetailedWebsite | null> => {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const websiteData = {
      ...mapToDbDetailedWebsite(website),
      user_id: user.id // Set the user_id to the current authenticated user
    };
    
    const { data, error } = await supabase
      .from('websites')
      .insert(websiteData)
      .select()
      .single();
      
    if (error) {
      console.error('Error saving website:', error);
      return null;
    }
    
    return mapFromDbDetailedWebsite(data);
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
