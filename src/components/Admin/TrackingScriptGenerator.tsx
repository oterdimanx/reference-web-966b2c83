
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateTrackingScript } from '@/services/eventTrackingService';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TrackingScriptGenerator() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch all users for admin selection
  const { data: users } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const { data, error } = await supabase.functions.invoke('admin-get-all-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data?.users || [];
    }
  });

  // Fetch websites for the selected user (or all if no user selected)
  const { data: websites } = useQuery({
    queryKey: ['websites-for-tracking', selectedUserId],
    queryFn: async () => {
      let query = supabase
        .from('websites')
        .select('id, domain, title, user_id')
        .order('domain');

      // Filter by user if one is selected
      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching websites:', error);
        return [];
      }

      return data;
    },
    enabled: true // Always enabled since admins can see all websites
  });

  const handleCopyScript = () => {
    if (!selectedWebsiteId) return;

    const script = generateTrackingScript(selectedWebsiteId);
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast({
      title: "Script copied!",
      description: "The tracking script has been copied to your clipboard.",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const trackingScript = selectedWebsiteId ? generateTrackingScript(selectedWebsiteId) : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Tracking Script</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select User</label>
          <Select value={selectedUserId} onValueChange={(value) => {
            setSelectedUserId(value);
            setSelectedWebsiteId(''); // Reset website selection when user changes
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user (optional - leave empty to see all websites)" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              <SelectItem value="">All Users</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Website</label>
          <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a website to track" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {websites?.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.domain} {website.title && `(${website.title})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWebsiteId && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Tracking Script</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyScript}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Textarea
              value={trackingScript}
              readOnly
              rows={12}
              className="font-mono text-sm"
              placeholder="Select a website to generate the tracking script"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Add this script to the &lt;head&gt; section of your website to start tracking events.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
