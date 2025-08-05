
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useLanguage } from '@/contexts/LanguageContext';

interface Event {
  id: string;
  session_id: string;
  event_type: 'click' | 'pageview';
  url: string;
  element_tag?: string;
  element_id?: string;
  element_classes?: string;
  click_x?: number;
  click_y?: number;
  screen_resolution?: string;
  user_agent?: string;
  ip_address?: string;
  received_at: string;
  client_timestamp: string;
  website_id?: string;
  websites?: {
    domain: string;
  };
}

export function EventAnalytics() {
  const { t } = useLanguage();
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin', 'events', showAllEvents, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          websites (
            domain
          )
        `)
        .order('received_at', { ascending: false });

      // Apply 7-day filter only when showAllEvents is false
      if (!showAllEvents) {
        query = query.gte('received_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        // For 7-day view, keep the original limit of 100
        const { data, error } = await query.limit(100);
        
        if (error) {
          console.error('Error fetching events:', error);
          return [];
        }
        
        return data as Event[];
      } else {
        // For all events, apply pagination
        const offset = (currentPage - 1) * pageSize;
        const { data, error } = await query.range(offset, offset + pageSize - 1);
        
        if (error) {
          console.error('Error fetching events:', error);
          return [];
        }
        
        return data as Event[];
      }
    }
  });

  // Get total count for pagination (only when showing all events)
  const { data: totalCount } = useQuery({
    queryKey: ['admin', 'events-count', showAllEvents],
    queryFn: async () => {
      if (!showAllEvents) return 0;
      
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching events count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: showAllEvents
  });

  const { data: eventStats } = useQuery({
    queryKey: ['admin', 'event-stats', showAllEvents],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('event_type, received_at');

      // Apply 7-day filter only when showAllEvents is false
      if (!showAllEvents) {
        query = query.gte('received_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching event stats:', error);
        return { totalEvents: 0, clickEvents: 0, pageviewEvents: 0 };
      }

      const totalEvents = data?.length || 0;
      const clickEvents = data?.filter(e => e.event_type === 'click').length || 0;
      const pageviewEvents = data?.filter(e => e.event_type === 'pageview').length || 0;

      return { totalEvents, clickEvents, pageviewEvents };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={!showAllEvents ? "default" : "outline"}
            onClick={() => {
              setShowAllEvents(false);
              setCurrentPage(1);
            }}
          >
            Last 7 Days
          </Button>
          <Button
            variant={showAllEvents ? "default" : "outline"}
            onClick={() => {
              setShowAllEvents(true);
              setCurrentPage(1);
            }}
          >
            All Events
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Events {!showAllEvents ? '(7d)' : '(All)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Click Events {!showAllEvents ? '(7d)' : '(All)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.clickEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Page Views {!showAllEvents ? '(7d)' : '(All)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.pageviewEvents || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showAllEvents ? 'All Events' : 'Recent Events'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Element</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant={event.event_type === 'click' ? 'default' : 'secondary'}>
                      {event.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.websites?.domain || 'Unknown'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={event.url}>
                    {event.url}
                  </TableCell>
                  <TableCell>
                    {event.element_tag && (
                      <span className="text-sm">
                        {event.element_tag}
                        {event.element_id && `#${event.element_id}`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(event.received_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.ip_address || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {showAllEvents && totalCount && totalCount > pageSize && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(Math.ceil(totalCount / pageSize), currentPage + 2);
                      return page >= start && page <= end;
                    })
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / pageSize), currentPage + 1))}
                      className={currentPage === Math.ceil(totalCount / pageSize) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
