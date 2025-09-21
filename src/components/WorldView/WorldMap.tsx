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
  'Russian Federation': 'RU',
  'South Korea': 'KR',
  'Korea, Republic of': 'KR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Morocco': 'MA',
  'Turkey': 'TR',
  'Israel': 'IL',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'New Zealand': 'NZ',
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
    // Try all possible country code properties from geography data
    const possibleCodes = [
      geoProperties.ISO_A2,
      geoProperties.ISO_A3,
      geoProperties.ADM0_A3,
      geoProperties.BRK_A3,
      geoProperties.ADM0_ISO,
      geoProperties.ISO_A2?.toLowerCase(),
      geoProperties.ISO_A3?.toLowerCase(),
      geoProperties.ADM0_A3?.toLowerCase(),
      geoProperties.BRK_A3?.toLowerCase(),
      geoProperties.ISO_A2?.toUpperCase(),
      geoProperties.ISO_A3?.toUpperCase(),
      geoProperties.ADM0_A3?.toUpperCase(),
      geoProperties.BRK_A3?.toUpperCase(),
      COUNTRY_CODE_MAPPINGS[geoProperties.ISO_A2] || '',
      COUNTRY_CODE_MAPPINGS[geoProperties.ISO_A3] || '',
      COUNTRY_CODE_MAPPINGS[geoProperties.ADM0_A3] || '',
    ].filter(Boolean);

    // Try multiple name properties for fallback matching
    const nameProperties = [
      geoProperties.NAME,
      geoProperties.NAME_EN,
      geoProperties.ADMIN,
      geoProperties.NAME_LONG,
      geoProperties.FORMAL_EN,
    ].filter(Boolean);

    nameProperties.forEach(name => {
      possibleCodes.push(
        name.toLowerCase(),
        COUNTRY_NAME_TO_CODE[name] || ''
      );
    });

    // Debug logging for specific countries we expect
    const isExpectedCountry = nameProperties.some(name => 
      name && ['United States', 'France', 'Germany', 'Canada'].includes(name)
    );
    
    if (isExpectedCountry) {
      console.log(`🌍 Trying to match expected country:`, {
        names: nameProperties,
        codes: possibleCodes.slice(0, 10), // First 10 codes to avoid spam
        allGeoProps: Object.keys(geoProperties).slice(0, 15)
      });
    }

    for (const code of possibleCodes) {
      const countryData = countryDataMap.get(code);
      if (countryData) {
        if (isExpectedCountry) {
          console.log(`🌍 ✅ Successfully matched ${nameProperties[0]} with code: ${code}`);
        }
        return countryData;
      }
    }

    return null;
  };

  // Calculate color intensity based on event count
  const getCountryColor = (geoProperties: any) => {
    // Enhanced debug logging to see what properties are actually available
    const availableProps = Object.keys(geoProperties).slice(0, 10); // First 10 properties
    if (Math.random() < 0.005) { // Very occasional logging
      console.log('🌍 Geography properties sample:', {
        available: availableProps,
        ISO_A2: geoProperties.ISO_A2,
        ISO_A3: geoProperties.ISO_A3,
        ADM0_A3: geoProperties.ADM0_A3,
        NAME: geoProperties.NAME,
        NAME_EN: geoProperties.NAME_EN,
        ADMIN: geoProperties.ADMIN
      });
    }

    const countryData = findCountryData(geoProperties);
    
    // Debug logging for color calculation
    const countryCode = geoProperties.ISO_A2 || geoProperties.ISO_A3 || geoProperties.ADM0_A3 || 'unknown';
    const countryName = geoProperties.NAME || geoProperties.NAME_EN || geoProperties.ADMIN || 'unknown';
    
    if (!countryData) {
      // Log specific countries that we expect to find
      const expectedCountries = ['United States', 'US', 'USA', 'France', 'FR'];
      if (expectedCountries.some(expected => 
        countryName.toLowerCase().includes(expected.toLowerCase()) || 
        countryCode.toLowerCase().includes(expected.toLowerCase())
      )) {
        console.log(`🌍 ❌ Expected country not found: ${countryName} (${countryCode})`, {
          allProps: Object.keys(geoProperties),
          ISO_A2: geoProperties.ISO_A2,
          ISO_A3: geoProperties.ISO_A3,
          ADM0_A3: geoProperties.ADM0_A3
        });
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