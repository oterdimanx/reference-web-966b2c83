import { useEffect, useState } from 'react';
import { generateSitemap, getStaticUrls, SitemapUrl } from '@/utils/sitemapGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');

  // Fetch dynamic URLs from websites table
  const { data: websites } = useQuery({
    queryKey: ['websites-for-sitemap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('domain, updated_at')
        .limit(1000); // Limit to prevent too many URLs
      
      if (error) {
        console.error('Error fetching websites for sitemap:', error);
        return [];
      }
      
      return data || [];
    }
  });

  useEffect(() => {
    const generateDynamicSitemap = () => {
      const staticUrls = getStaticUrls();
      const dynamicUrls: SitemapUrl[] = [];

      // Add dynamic URLs from websites (if needed for SEO)
      if (websites) {
        websites.forEach(website => {
          // You can add dynamic pages here if you have public website detail pages
          // For now, we'll keep it simple with static pages only
        });
      }

      const allUrls = [...staticUrls, ...dynamicUrls];
      const xml = generateSitemap(allUrls);
      setSitemapXml(xml);
    };

    generateDynamicSitemap();
  }, [websites]);

  // Set proper content type for XML
  useEffect(() => {
    if (sitemapXml) {
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // For download functionality if needed
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'sitemap.xml';
    }
  }, [sitemapXml]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Sitemap</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">XML Sitemap</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This sitemap contains all the pages on our website that are available to search engines.
              </p>
            </div>
            
            {sitemapXml ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 overflow-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {sitemapXml}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Generating sitemap...</p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <a 
                href="/sitemap.xml" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Raw XML
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
