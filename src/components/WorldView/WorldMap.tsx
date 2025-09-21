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

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Fallback mapping for geography data inconsistencies
const COUNTRY_CODE_MAPPINGS: Record<string, string> = {
  '-99': 'US', // Some disputed territories
  'XK': 'XK',  // Kosovo
  'GB': 'UK',  // United Kingdom variations
  'UK': 'GB',  // Reverse mapping
  'US': 'USA', // United States variations
  'USA': 'US', // Reverse mapping
};

// Common country name to code mappings as fallback
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'United States': 'US',
  'United States of America': 'US',
  'United Kingdom': 'GB',
  'France': 'FR',
  'Germany': 'DE',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Russia': 'RU',
  'South Korea': 'KR',
  'Italy': 'IT',
  'Spain': 'ES',
};

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

  // Debug logging
  React.useEffect(() => {
    console.log('🌍 WorldMap Debug - Events by Country:', eventsByCountry);
    console.log('🌍 WorldMap Debug - Total countries with events:', eventsByCountry.length);
    eventsByCountry.forEach((country, index) => {
      console.log(`🌍 Country ${index + 1}:`, {
        name: country.countryName,
        code: country.countryCode,
        events: country.totalEvents,
        coordinates: country.coordinates
      });
    });
  }, [eventsByCountry]);

  // Enhanced country data map with multiple matching strategies
  const countryDataMap = React.useMemo(() => {
    const map = new Map<string, EventsByCountry>();
    
    eventsByCountry.forEach(country => {
      if (!country.countryCode) {
        console.warn('🌍 Country without code:', country.countryName);
        return;
      }

      const codes = [
        country.countryCode,
        country.countryCode.toLowerCase(),
        country.countryCode.toUpperCase(),
        COUNTRY_CODE_MAPPINGS[country.countryCode] || '',
        COUNTRY_CODE_MAPPINGS[country.countryCode.toLowerCase()] || '',
        COUNTRY_CODE_MAPPINGS[country.countryCode.toUpperCase()] || '',
      ].filter(Boolean);

      codes.forEach(code => {
        map.set(code, country);
      });

      // Also map by country name for fallback
      if (country.countryName) {
        map.set(country.countryName.toLowerCase(), country);
        const standardCode = COUNTRY_NAME_TO_CODE[country.countryName];
        if (standardCode) {
          map.set(standardCode, country);
          map.set(standardCode.toLowerCase(), country);
          map.set(standardCode.toUpperCase(), country);
        }
      }
    });

    console.log('🌍 Country Data Map size:', map.size);
    console.log('🌍 Country Data Map keys:', Array.from(map.keys()));
    return map;
  }, [eventsByCountry]);

  // Enhanced country matching function
  const findCountryData = (geoProperties: any): EventsByCountry | null => {
    const possibleCodes = [
      geoProperties.ISO_A2,
      geoProperties.ISO_A3,
      geoProperties.ADM0_A3,
      geoProperties.ISO_A2?.toLowerCase(),
      geoProperties.ISO_A3?.toLowerCase(),
      geoProperties.ADM0_A3?.toLowerCase(),
      geoProperties.ISO_A2?.toUpperCase(),
      geoProperties.ISO_A3?.toUpperCase(),
      geoProperties.ADM0_A3?.toUpperCase(),
      COUNTRY_CODE_MAPPINGS[geoProperties.ISO_A2] || '',
      COUNTRY_CODE_MAPPINGS[geoProperties.ISO_A3] || '',
    ].filter(Boolean);

    // Try country name matching as fallback
    if (geoProperties.NAME) {
      possibleCodes.push(
        geoProperties.NAME.toLowerCase(),
        COUNTRY_NAME_TO_CODE[geoProperties.NAME] || ''
      );
    }

    for (const code of possibleCodes) {
      const countryData = countryDataMap.get(code);
      if (countryData) {
        return countryData;
      }
    }

    return null;
  };

  // Calculate color intensity based on event count
  const getCountryColor = (geoProperties: any) => {
    const countryData = findCountryData(geoProperties);
    
    // Debug logging for color calculation
    const countryCode = geoProperties.ISO_A2 || geoProperties.ISO_A3 || 'unknown';
    const countryName = geoProperties.NAME || 'unknown';
    
    if (!countryData) {
      // Only log for first few to avoid spam
      if (Math.random() < 0.01) {
        console.log(`🌍 No data for country: ${countryName} (${countryCode})`);
      }
      return "hsl(var(--muted))";
    }

    console.log(`🌍 ✅ Found data for ${countryName} (${countryCode}):`, countryData.totalEvents, 'events');

    const eventCount = countryData.totalEvents;
    
    // Enhanced color visibility - more distinct levels
    if (eventCount >= 1 && eventCount <= 3) {
      return "hsl(var(--primary) / 0.6)"; // Increased visibility for very low counts
    } else if (eventCount <= 10) {
      return "hsl(var(--primary) / 0.75)"; // Higher visibility for low counts  
    } else if (eventCount <= 30) {
      return "hsl(var(--primary) / 0.85)"; // Strong visibility for medium counts
    } else if (eventCount <= 100) {
      return "hsl(var(--primary) / 0.95)"; // Very strong for high counts
    } else {
      return "hsl(var(--primary))"; // Full intensity for very high counts
    }
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryData = findCountryData(geo.properties);
    
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
          scale: 200,
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
                    fill={getCountryColor(geo.properties)}
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