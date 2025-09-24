import { supabase } from '@/integrations/supabase/client';
import { sanitizeDomain } from '@/utils/domainUtils';

export interface DirectoryWebsite {
  id: string;
  domain: string;
  title: string | null;
  description: string | null;
  category_id: string | null;
  website_id: string | null;
  avg_position: number;
  keyword_count: number;
  position_change: number;
  top_keyword: string | null;
  top_keyword_position: number | null;
  image_path: string | null;
  contact_name: string | null;
  contact_email: string | null;
  phone_number: string | null;
  phone_prefix: string | null;
  reciprocal_link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface PublicDirectoryWebsite {
  id: string;
  domain: string;
  title: string | null;
  description: string | null;
  category_id: string | null;
  website_id: string | null; // Include this field as null
  avg_position: number;
  keyword_count: number;
  position_change: number;
  top_keyword: string | null;
  top_keyword_position: number | null;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Contact fields are excluded for privacy
  contact_name: null;
  contact_email: null;
  phone_number: null;
  phone_prefix: null;
  reciprocal_link: null; // Include this field as null
  category?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDirectoryWebsiteData {
  domain: string;
  title?: string | null;
  description?: string | null;
  category_id?: string | null;
  website_id?: string | null;
  avg_position?: number;
  keyword_count?: number;
  position_change?: number;
  top_keyword?: string | null;
  top_keyword_position?: number | null;
  image_path?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  phone_number?: string | null;
  phone_prefix?: string | null;
  reciprocal_link?: string | null;
  is_active?: boolean;
}

export const getDirectoryWebsites = async (): Promise<DirectoryWebsite[]> => {
  try {
    // Use public view that excludes sensitive contact information
    const { data: directoryData, error: directoryError } = await supabase
      .from('directory_websites_public')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (directoryError) {
      console.error('Error fetching directory websites:', directoryError);
      throw directoryError;
    }

    // Then get categories separately
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Manually join the data and ensure all fields are present
    const transformedData = directoryData?.map(item => ({
      ...item,
      website_id: null, // Not exposed in public view
      contact_name: null,
      contact_email: null,
      phone_number: null,
      phone_prefix: null,
      reciprocal_link: null, // Not exposed in public view
      category: item.category_id 
        ? categoriesData?.find(cat => cat.id === item.category_id) || null
        : null
    })) as DirectoryWebsite[] || [];

    return transformedData;
  } catch (error) {
    console.error('Error in getDirectoryWebsites:', error);
    return [];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

// Admin functions for managing directory websites
export const createDirectoryWebsite = async (website: CreateDirectoryWebsiteData): Promise<DirectoryWebsite | null> => {
  try {
    // Normalize the domain before saving (trigger will also handle this, but being explicit)
    const normalizedWebsite = {
      ...website,
      domain: sanitizeDomain(website.domain)
    };
    
    const { data, error } = await supabase
      .from('directory_websites')
      .insert(normalizedWebsite)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating directory website:', error);
      throw error;
    }

    // Get the category separately if needed
    let category = null;
    if (data.category_id) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', data.category_id)
        .single();
      
      if (!categoryError) {
        category = categoryData;
      }
    }

    return {
      ...data,
      category
    };
  } catch (error) {
    console.error('Error in createDirectoryWebsite:', error);
    return null;
  }
};

export const updateDirectoryWebsite = async (id: string, updates: Partial<DirectoryWebsite>): Promise<DirectoryWebsite | null> => {
  try {
    // Normalize domain if it's being updated
    const normalizedUpdates = {
      ...updates,
      ...(updates.domain && { domain: sanitizeDomain(updates.domain) })
    };
    
    const { data, error } = await supabase
      .from('directory_websites')
      .update(normalizedUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating directory website:', error);
      throw error;
    }

    // Get the category separately if needed
    let category = null;
    if (data.category_id) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', data.category_id)
        .single();
      
      if (!categoryError) {
        category = categoryData;
      }
    }

    return {
      ...data,
      category
    };
  } catch (error) {
    console.error('Error in updateDirectoryWebsite:', error);
    return null;
  }
};

export const checkDomainExists = async (domain: string): Promise<boolean> => {
  try {
    // Use the same domain sanitization logic
    const normalizedDomain = sanitizeDomain(domain);
    
    const { data, error } = await supabase
      .from('directory_websites')
      .select('id')
      .eq('domain', normalizedDomain)
      .limit(1);

    if (error) {
      console.error('Error checking domain existence:', error);
      throw error;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Error in checkDomainExists:', error);
    return false;
  }
};

export const deleteDirectoryWebsite = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('directory_websites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting directory website:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDirectoryWebsite:', error);
    return false;
  }
};
