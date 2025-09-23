import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Code } from 'lucide-react';
import { UserTrackingScriptGenerator } from '@/components/TrackingScript/UserTrackingScriptGenerator';

export function EventsLegend() {
  const { t } = useLanguage();

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{t('worldViewPage', 'legend.title')}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Code className="h-4 w-4" />
              {t('trackingScriptPage', 'generateScript')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('trackingScriptPage', 'generateScript')}</DialogTitle>
            </DialogHeader>
            <UserTrackingScriptGenerator />
          </DialogContent>
        </Dialog>
      </div>
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