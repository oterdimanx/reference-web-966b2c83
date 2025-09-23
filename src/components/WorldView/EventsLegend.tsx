import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function EventsLegend() {
  const { t } = useLanguage();

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">{t('worldViewPage', 'legend.title')}</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: "hsl(var(--primary) / 0.3)" }}
          />
          <span className="text-xs text-muted-foreground">
            {t('worldViewPage', 'legend.low')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}
          />
          <span className="text-xs text-muted-foreground">
            {t('worldViewPage', 'legend.medium')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          />
          <span className="text-xs text-muted-foreground">
            {t('worldViewPage', 'legend.high')}
          </span>
        </div>
      </div>
    </div>
  );
}