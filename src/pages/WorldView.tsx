import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { WorldViewService, WorldViewData } from '@/services/worldViewService';
import { WorldMap } from '@/components/WorldView/WorldMap';
import { EventsLegend } from '@/components/WorldView/EventsLegend';
import { DateRangeFilter } from '@/components/WorldView/DateRangeFilter';
import { WebsiteFilter } from '@/components/WorldView/WebsiteFilter';
import { WorldViewStats } from '@/components/WorldView/WorldViewStats';
import { useHasWebsiteEvents } from '@/hooks/useHasWebsiteEvents';
import { PropellerSpinner } from '@/components/ui/propeller-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Globe } from 'lucide-react';
import { DynamicHead } from '@/components/SEO/DynamicHead';

export function WorldView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [worldViewData, setWorldViewData] = useState<WorldViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEvents, setHasEvents] = useState<boolean>(false);
  const [isAllTime, setIsAllTime] = useState(true);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Check if user has events on component mount
  useEffect(() => {
    const checkUserEvents = async () => {
      if (!user?.id) return;
      
      try {
        const hasUserEvents = await WorldViewService.hasUserEvents(user.id);
        setHasEvents(hasUserEvents);
        
        if (!hasUserEvents) {
          setLoading(false);
          return;
        }

        // Load initial data (all time, all websites)
        await loadWorldViewData();
      } catch (err) {
        console.error('Error checking user events:', err);
        setError(t('worldViewPage', 'error'));
        setLoading(false);
      }
    };

    checkUserEvents();
  }, [user?.id]);

  const loadWorldViewData = async (startDate?: Date, endDate?: Date, websiteId?: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await WorldViewService.getWorldViewData(
        user.id,
        startDate || undefined,
        endDate || undefined,
        websiteId || undefined
      );
      setWorldViewData(data);
    } catch (err) {
      console.error('Error loading world view data:', err);
      setError(t('worldViewPage', 'error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ start: startDate, end: endDate });
    
    if (startDate && endDate) {
      await loadWorldViewData(startDate, endDate, selectedWebsiteId || undefined);
    }
  };

  const handleToggleAllTime = async (allTime: boolean) => {
    setIsAllTime(allTime);
    
    if (allTime) {
      setDateRange({ start: null, end: null });
      await loadWorldViewData(undefined, undefined, selectedWebsiteId || undefined);
    }
  };

  const handleWebsiteChange = async (websiteId: string | null) => {
    setSelectedWebsiteId(websiteId);
    
    // Reload data with new website filter
    if (isAllTime) {
      await loadWorldViewData(undefined, undefined, websiteId || undefined);
    } else {
      await loadWorldViewData(dateRange.start || undefined, dateRange.end || undefined, websiteId || undefined);
    }
  };

  // Show no data message if user has no events
  if (!loading && !hasEvents) {
    return (
      <div className="flex flex-col min-h-screen">
        <DynamicHead pageKey="worldView" />
        <Header />
        <main className="flex-grow container mx-auto p-6">
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('worldViewPage', 'noData')}</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('worldViewPage', 'noDataDescription')}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead pageKey="worldView" />
      <Header />
      <main className="flex-grow container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('worldViewPage', 'title')}</h1>
        <p className="text-muted-foreground">
          {t('worldViewPage', 'description')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <PropellerSpinner 
            size="xl" 
            message={t('worldViewPage', 'loading')}
          />
        </div>
      )}

      {/* Main Content */}
      {!loading && worldViewData && (
        <>
          {/* Stats */}
          <WorldViewStats data={worldViewData} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <WebsiteFilter
                selectedWebsiteId={selectedWebsiteId}
                onWebsiteChange={handleWebsiteChange}
              />
              <DateRangeFilter
                onDateRangeChange={handleDateRangeChange}
                isAllTime={isAllTime}
                onToggleAllTime={handleToggleAllTime}
              />
              <EventsLegend />
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-card border rounded-lg p-4 h-96 lg:h-[500px]">
                <WorldMap eventsByCountry={worldViewData.eventsByCountry} />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {worldViewData.eventsByCountry.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t('worldViewPage', 'stats.noCountryData')}
              </p>
            </div>
          )}
        </>
      )}
      </main>
      <Footer />
    </div>
  );
}