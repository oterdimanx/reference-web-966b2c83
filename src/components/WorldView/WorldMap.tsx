import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventsByCountry } from '@/services/worldViewService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface WorldMapProps {
  eventsByCountry: EventsByCountry[];
}

interface TooltipData {
  country: EventsByCountry | null;
  x: number;
  y: number;
}

export function WorldMap({ eventsByCountry }: WorldMapProps) {
  const { t } = useLanguage();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Create a map for quick lookups
  const countryDataMap = React.useMemo(() => {
    const map = new Map<string, EventsByCountry>();
    eventsByCountry.forEach(country => {
      // Try both ISO codes (some data sources use different formats)
      map.set(country.countryCode.toLowerCase(), country);
      map.set(country.countryCode.toUpperCase(), country);
    });
    return map;
  }, [eventsByCountry]);

  // Calculate color intensity based on event count
  const getCountryColor = (countryCode: string) => {
    const countryData = countryDataMap.get(countryCode) || countryDataMap.get(countryCode.toLowerCase()) || countryDataMap.get(countryCode.toUpperCase());
    
    if (!countryData) {
      return "hsl(var(--muted))"; // Default gray for countries with no data
    }

    const eventCount = countryData.totalEvents;
    
    if (eventCount <= 10) {
      return "hsl(var(--primary) / 0.3)"; // Light blue
    } else if (eventCount <= 50) {
      return "hsl(var(--primary) / 0.6)"; // Medium blue
    } else {
      return "hsl(var(--primary))"; // Dark blue
    }
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryCode = geo.properties.ISO_A2 || geo.properties.ISO_A3;
    const countryData = countryDataMap.get(countryCode) || countryDataMap.get(countryCode?.toLowerCase()) || countryDataMap.get(countryCode?.toUpperCase());
    
    if (countryData) {
      setTooltip({
        country: countryData,
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projectionConfig={{
          scale: 147,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.ISO_A2 || geo.properties.ISO_A3;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(countryCode)}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none",
                      },
                      hover: {
                        fill: "hsl(var(--primary) / 0.8)",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "hsl(var(--primary))",
                        outline: "none",
                      },
                    }}
                    onMouseEnter={(event) => handleMouseEnter(geo, event)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltip && tooltip.country && (
        <div
          className="fixed z-50 bg-popover border rounded-md p-3 shadow-md pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm font-medium">{tooltip.country.countryName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {tooltip.country.totalEvents} {t('worldViewPage', 'map.tooltip.events')}
          </div>
          <div className="text-xs text-muted-foreground">
            {tooltip.country.eventTypes.pageview} {t('worldViewPage', 'map.tooltip.pageviews')}, {tooltip.country.eventTypes.click} {t('worldViewPage', 'map.tooltip.clicks')}
          </div>
        </div>
      )}
    </div>
  );
}