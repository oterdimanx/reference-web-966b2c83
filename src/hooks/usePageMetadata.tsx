import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PageMetadata {
  id: string;
  page_key: string;
  language: string;
  title?: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  author?: string;
}

export const usePageMetadata = (pageKey: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['page_metadata', pageKey, language],
    queryFn: async (): Promise<PageMetadata | null> => {
      const { data, error } = await supabase
        .from('page_metadata')
        .select('*')
        .eq('page_key', pageKey)
        .eq('language', language)
        .maybeSingle();

      if (error) {
        console.error('Error fetching page metadata:', error);
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllPageMetadata = () => {
  return useQuery({
    queryKey: ['all_page_metadata'],
    queryFn: async (): Promise<PageMetadata[]> => {
      const { data, error } = await supabase
        .from('page_metadata')
        .select('*')
        .order('page_key', { ascending: true })
        .order('language', { ascending: true });

      if (error) {
        console.error('Error fetching all page metadata:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};