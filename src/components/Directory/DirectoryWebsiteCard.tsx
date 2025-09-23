
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DirectoryWebsite } from '@/services/directoryService';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getImageUrl } from '@/utils/imageUtils';

interface DirectoryWebsiteCardProps {
  website: DirectoryWebsite;
}

export function DirectoryWebsiteCard({ website }: DirectoryWebsiteCardProps) {
  const { t } = useLanguage();
  const imageUrl = getImageUrl(website.image_path);

  const getPositionChangeIcon = () => {
    if (website.position_change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (website.position_change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={`${website.domain} logo`}
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {website.title || website.domain}
            <a
              href={`https://${website.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rank-teal hover:text-rank-teal/80"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardTitle>
          {website.category && (
            <Badge variant="secondary">
              {website.category.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{website.domain}</p>
      </CardHeader>
      
      <CardContent>
        {website.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {website.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-rank-teal">{website.avg_position}</p>
            <p className="text-muted-foreground">{t('directoryPage', 'avgPosition')}</p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold">{website.keyword_count}</p>
            <p className="text-muted-foreground">{t('directoryPage', 'keywords')}</p>
          </div>
          
          <div className="text-center flex items-center justify-center gap-1">
            {getPositionChangeIcon()}
            <span className="font-semibold">
              {website.position_change > 0 ? '+' : ''}{website.position_change}
            </span>
            <p className="text-muted-foreground ml-1">{t('directoryPage', 'change')}</p>
          </div>
          
          {website.top_keyword && (
            <div className="text-center">
              <p className="font-semibold">{website.top_keyword_position || 'N/A'}</p>
              <p className="text-muted-foreground truncate" title={website.top_keyword}>
                {website.top_keyword}
              </p>
            </div>
          )}
        </div>
        
        {(website.contact_name || website.contact_email) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2">{t('directoryPage', 'contactInformation')}</h4>
            {website.contact_name && (
              <p className="text-sm text-muted-foreground">{website.contact_name}</p>
            )}
            {website.contact_email && (
              <p className="text-sm text-muted-foreground">{website.contact_email}</p>
            )}
            {website.phone_number && (
              <p className="text-sm text-muted-foreground">
                {website.phone_prefix} {website.phone_number}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
