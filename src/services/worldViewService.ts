import { supabase } from "@/integrations/supabase/client";

export interface EventsByCountry {
  countryCode: string;
  countryName: string;
  coordinates: [number, number];
  totalEvents: number;
  eventTypes: {
    pageview: number;
    click: number;
  };
}

export interface WorldViewData {
  eventsByCountry: EventsByCountry[];
  totalEvents: number;
  totalCountries: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export class WorldViewService {
  static async getUserEvents(
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<{ ip: string; eventType: string; count: number }[]> {
    let query = supabase
      .from('events')
      .select(`
        ip_address,
        event_type,
        websites!inner(user_id)
      `)
      .eq('websites.user_id', userId)
      .not('ip_address', 'is', null);

    if (startDate) {
      query = query.gte('client_timestamp', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('client_timestamp', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }

    // Aggregate events by IP and event type
    const aggregated: { [key: string]: { [eventType: string]: number } } = {};
    
    data?.forEach(event => {
      const ip = event.ip_address;
      const eventType = event.event_type;
      
      if (!aggregated[ip]) {
        aggregated[ip] = {};
      }
      
      aggregated[ip][eventType] = (aggregated[ip][eventType] || 0) + 1;
    });

    // Convert to flat array format
    const result: { ip: string; eventType: string; count: number }[] = [];
    Object.entries(aggregated).forEach(([ip, eventTypes]) => {
      Object.entries(eventTypes).forEach(([eventType, count]) => {
        result.push({ ip, eventType, count });
      });
    });

    return result;
  }

  static async convertIPsToCountries(
    ipAddresses: string[]
  ): Promise<{ [ip: string]: { countryCode: string; countryName: string; coordinates: [number, number] } | null }> {
    // Remove duplicates
    const uniqueIPs = [...new Set(ipAddresses)];
    
    // Cap the number of IPs to process to avoid timeouts
    const MAX_IPS = 300;
    const processedIPs = uniqueIPs.length > MAX_IPS ? uniqueIPs.slice(0, MAX_IPS) : uniqueIPs;
    
    if (uniqueIPs.length > MAX_IPS) {
      console.log(`Limiting IP processing to ${MAX_IPS} out of ${uniqueIPs.length} unique IPs`);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-country-from-ip', {
        body: { ipAddresses: processedIPs }
      });

      if (error) {
        console.error('Error converting IPs to countries:', error);
        throw error;
      }

      return data.results;
    } catch (error) {
      // Retry once for FunctionsFetchError
      if (error.message?.includes('FunctionsFetchError')) {
        console.log('Retrying IP conversion after FunctionsFetchError...');
        try {
          const { data, error: retryError } = await supabase.functions.invoke('get-country-from-ip', {
            body: { ipAddresses: processedIPs }
          });

          if (retryError) {
            throw new Error(`Failed to convert IPs to countries on retry: ${retryError.message}`);
          }

          return data.results;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  }

  static async getWorldViewData(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorldViewData> {
    // Get user events
    const events = await this.getUserEvents(userId, startDate, endDate);
    
    if (events.length === 0) {
      return {
        eventsByCountry: [],
        totalEvents: 0,
        totalCountries: 0,
        dateRange: {
          startDate: startDate || new Date(0),
          endDate: endDate || new Date()
        }
      };
    }

    // Get unique IP addresses
    const uniqueIPs = [...new Set(events.map(e => e.ip))];
    
    // Convert IPs to countries
    const ipToCountry = await this.convertIPsToCountries(uniqueIPs);

    // Aggregate events by country
    const countryAggregation: { [countryCode: string]: EventsByCountry } = {};

    events.forEach(event => {
      const countryData = ipToCountry[event.ip];
      
      if (!countryData) return; // Skip if country not resolved
      
      const { countryCode, countryName, coordinates } = countryData;
      
      if (!countryAggregation[countryCode]) {
        countryAggregation[countryCode] = {
          countryCode,
          countryName,
          coordinates,
          totalEvents: 0,
          eventTypes: {
            pageview: 0,
            click: 0
          }
        };
      }

      countryAggregation[countryCode].totalEvents += event.count;
      
      if (event.eventType === 'pageview' || event.eventType === 'click') {
        countryAggregation[countryCode].eventTypes[event.eventType] += event.count;
      }
    });

    const eventsByCountry = Object.values(countryAggregation);
    const totalEvents = eventsByCountry.reduce((sum, country) => sum + country.totalEvents, 0);

    return {
      eventsByCountry,
      totalEvents,
      totalCountries: eventsByCountry.length,
      dateRange: {
        startDate: startDate || new Date(0),
        endDate: endDate || new Date()
      }
    };
  }

  static async hasUserEvents(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        websites!inner(user_id)
      `)
      .eq('websites.user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking user events:', error);
      return false;
    }

    return data && data.length > 0;
  }
}