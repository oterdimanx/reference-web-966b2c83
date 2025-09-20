import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WorldViewData } from '@/services/worldViewService';
import { StatCard } from '@/components/common/StatCard';
import { Globe, MapPin, TrendingUp } from 'lucide-react';

interface WorldViewStatsProps {
  data: WorldViewData;
}

export function WorldViewStats({ data }: WorldViewStatsProps) {
  const { t } = useLanguage();

  const topCountry = data.eventsByCountry.length > 0 
    ? data.eventsByCountry.reduce((max, country) => 
        country.totalEvents > max.totalEvents ? country : max
      )
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title={t('worldViewPage', 'stats.totalEvents')}
        value={data.totalEvents.toLocaleString()}
        icon={<Globe className="h-4 w-4" />}
      />
      
      <StatCard
        title={t('worldViewPage', 'stats.countries')}
        value={data.totalCountries.toString()}
        icon={<MapPin className="h-4 w-4" />}
      />
      
      <StatCard
        title={t('worldViewPage', 'stats.topCountry')}
        value={topCountry ? `${topCountry.countryName} (${topCountry.totalEvents})` : t('worldViewPage', 'stats.noCountryData')}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}