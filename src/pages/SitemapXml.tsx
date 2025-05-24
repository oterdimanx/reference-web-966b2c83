
import { useEffect } from 'react';
import { generateSitemap, getStaticUrls } from '@/utils/sitemapGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const SitemapXml = () => {
  // Fetch dynamic URLs from websites table
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites-for-sitemap-xml'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('domain, updated_at')
        .limit(1000);
      
      if (error) {
        console.error('Error fetching websites for sitemap:', error);
        return [];
      }
      
      return data || [];
    }
  });

  useEffect(() => {
    if (!isLoading && websites !== undefined) {
      const staticUrls = getStaticUrls();
      const xml = generateSitemap(staticUrls);
      
      // Replace current page content with XML
      document.open();
      document.write(xml);
      document.close();
    }
  }, [websites, isLoading]);

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px' }}>
        Generating sitemap...
      </div>
    );
  }

  return null;
};

export default SitemapXml;
