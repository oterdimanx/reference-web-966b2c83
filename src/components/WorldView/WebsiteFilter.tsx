import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserWebsites } from '@/services/websiteService';
import { RankingSummary } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { TrackingScriptPopover } from './TrackingScriptPopover';

interface WebsiteFilterProps {
  selectedWebsiteId: string | null;
  onWebsiteChange: (websiteId: string | null) => void;
}

export const WebsiteFilter: React.FC<WebsiteFilterProps> = ({
  selectedWebsiteId,
  onWebsiteChange,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [websites, setWebsites] = useState<RankingSummary[]>([]);
  const [websitesWithoutData, setWebsitesWithoutData] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      if (!user?.id) return;
      
      try {
        const userWebsites = await getUserWebsites();
        setWebsites(userWebsites);

        // Check which websites have event data
        const websiteIds = userWebsites.map(w => w.websiteId);
        if (websiteIds.length > 0) {
          const { data: eventsData } = await supabase
            .from('events')
            .select('website_id')
            .in('website_id', websiteIds);

          const websitesWithEvents = new Set(eventsData?.map(e => e.website_id) || []);
          const websitesWithoutEvents = new Set(
            websiteIds.filter(id => !websitesWithEvents.has(id))
          );
          setWebsitesWithoutData(websitesWithoutEvents);
        }
      } catch (error) {
        console.error('Error fetching websites for filter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Building2 size={16} />
            {t('worldViewPage', 'filter.loadingWebsites')}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 size={16} />
          {t('worldViewPage', 'filter.websites')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedWebsiteId || 'all'}
          onValueChange={(value) => onWebsiteChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                {t('worldViewPage', 'filter.allWebsites')}
              </div>
            </SelectItem>
            {websites.map((website) => (
              <SelectItem key={website.websiteId} value={website.websiteId}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {website.domain}
                      </span>
                      {website.title && (
                        <span className="text-xs text-muted-foreground truncate max-w-40">
                          {website.title}
                        </span>
                      )}
                    </div>
                  </div>
                  {websitesWithoutData.has(website.websiteId) && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <TrackingScriptPopover
                        websiteId={website.websiteId}
                        websiteDomain={website.domain}
                      />
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedWebsiteId && (
          <div className="mt-2 text-xs text-muted-foreground">
            {t('worldViewPage', 'filter.filterActive')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};