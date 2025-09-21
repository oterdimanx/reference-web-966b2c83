import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useHasWebsiteEvents = () => {
  const [hasEvents, setHasEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkForEvents = async () => {
      if (!user) {
        setHasEvents(false);
        setIsLoading(false);
        return;
      }

      try {
        // First get user's websites
        const { data: websites, error: websitesError } = await supabase
          .from('websites')
          .select('id')
          .eq('user_id', user.id);

        if (websitesError || !websites || websites.length === 0) {
          setHasEvents(false);
          setIsLoading(false);
          return;
        }

        const websiteIds = websites.map(w => w.id);

        // Check if any events exist for user's websites
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id')
          .in('website_id', websiteIds)
          .limit(1);

        if (eventsError) {
          console.error('Error checking for events:', eventsError);
          setHasEvents(false);
        } else {
          setHasEvents(events && events.length > 0);
        }
      } catch (error) {
        console.error('Error checking for website events:', error);
        setHasEvents(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkForEvents();
  }, [user]);

  return { hasEvents, isLoading };
};