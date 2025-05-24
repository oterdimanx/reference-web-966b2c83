
export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const baseUrl = window.location.origin;
  
  const urlEntries = urls.map(url => {
    const fullUrl = url.loc.startsWith('http') ? url.loc : `${baseUrl}${url.loc}`;
    
    return `  <url>
    <loc>${fullUrl}</loc>
    ${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `    <priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

export const getStaticUrls = (): SitemapUrl[] => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    {
      loc: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: '/about',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: '/pricing',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: '/auth',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: '/rankings',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: '/keywords',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: '/privacy',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      loc: '/terms',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.3
    }
  ];
};
