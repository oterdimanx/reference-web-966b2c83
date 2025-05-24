
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          websites (
            domain
          )
        `)
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data as Event[];
    }
  });

  const { data: eventStats } = useQuery({
    queryKey: ['admin', 'event-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('event_type, created_at::date as date')
        .gte('received_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Events (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.clickEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Views (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.pageviewEvents || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
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
        </CardContent>
      </Card>
    </div>
  );
}
