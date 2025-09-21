import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserWebsites } from '@/services/websiteService';
import { RankingSummary } from '@/lib/mockData';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      if (!user?.id) return;
      
      try {
        const userWebsites = await getUserWebsites();
        setWebsites(userWebsites);
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