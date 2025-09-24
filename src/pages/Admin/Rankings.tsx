
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

import { useAdminStatus } from '@/hooks/use-admin-status';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Globe, Eye, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { triggerRankingCheck } from '@/services/rankingService';
import { RankingHistory } from '@/components/RankTracker/RankingHistory';
import { RankingDebugTest } from '@/components/Debug/RankingDebugTest';

interface Website {
  id: string;
  domain: string;
  keywords: string;
  user_id: string;
  created_at: string;
  owner_email?: string;
}

const AdminRankingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, adminLoading } = useAdminStatus(user?.id);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [triggeringCheck, setTriggeringCheck] = useState<string | null>(null);

  const loadWebsites = async () => {
    try {
      // First get websites
      const { data: websitesData, error: websitesError } = await supabase
        .from('websites')
        .select('*')
        .not('keywords', 'is', null)
        .neq('keywords', '')
        .order('created_at', { ascending: false });

      if (websitesError) {
        console.error('Error fetching websites:', websitesError);
        toast.error('Failed to load websites');
        return;
      }

      // Get profiles for the user IDs
      const userIds = [...new Set(websitesData?.map(w => w.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map websites with owner emails
      const websitesWithOwner = (websitesData || []).map(website => ({
        ...website,
        owner_email: profilesData?.find(p => p.id === website.user_id)?.username || null
      }));

      setWebsites(websitesWithOwner);
    } catch (error) {
      console.error('Exception fetching websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setWebsitesLoading(false);
    }
  };

  const handleTriggerRankingCheck = async (website: Website) => {
    setTriggeringCheck(website.id);
    try {
      const success = await triggerRankingCheck(website.id);
      if (success) {
        toast.success(`Ranking check started for ${website.domain}! Results will appear shortly.`);
      } else {
        toast.error('Failed to start ranking check');
      }
    } catch (error) {
      console.error('Error triggering ranking check:', error);
      toast.error('Failed to trigger ranking check');
    } finally {
      setTriggeringCheck(null);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadWebsites();
    }
  }, [authLoading, user, isAdmin]);

  // If not logged in, redirect to auth page
  if (!authLoading && !user) {
    return <Navigate to="/auth" />;
  }

  // If loading admin status
  if (authLoading || adminLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h2>
                <p className="mb-6 text-muted-foreground">
                  You don't have administrator privileges to access this page.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = '/'}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin - Rankings Management</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Websites with Keywords
              </CardTitle>
              <CardDescription>
                Manage ranking checks for websites that have keywords configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {websitesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : websites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No websites with keywords found.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {websites.map((website) => (
                    <div key={website.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{website.domain}</p>
                          {website.user_id === user?.id && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded text-xs font-medium">
                              <Crown className="h-3 w-3" />
                              Admin
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Keywords: {website.keywords.split(',').length} • Added: {new Date(website.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedWebsite(website)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTriggerRankingCheck(website)}
                          disabled={triggeringCheck === website.id}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1 ${triggeringCheck === website.id ? 'animate-spin' : ''}`} />
                          {triggeringCheck === website.id ? 'Checking...' : 'Check'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website Details</CardTitle>
              <CardDescription>
                {selectedWebsite ? (
                  selectedWebsite.user_id === user?.id ? (
                    `Ranking details for ${selectedWebsite.domain}`
                  ) : (
                    `Ranking details for ${selectedWebsite.domain}${selectedWebsite.owner_email ? ` owned by ${selectedWebsite.owner_email}` : ''}`
                  )
                ) : 'Select a website to view ranking details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedWebsite ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWebsite.keywords.split(',').map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <Button
                      onClick={() => handleTriggerRankingCheck(selectedWebsite)}
                      disabled={triggeringCheck === selectedWebsite.id}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${triggeringCheck === selectedWebsite.id ? 'animate-spin' : ''}`} />
                      {triggeringCheck === selectedWebsite.id ? 'Checking Rankings...' : 'Trigger Ranking Check'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select a website from the list to view details and trigger ranking checks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedWebsite && (
          <div className="mt-6 space-y-6">
            <RankingHistory 
              websiteId={selectedWebsite.id} 
              websiteDomain={selectedWebsite.domain} 
            />
            <RankingDebugTest />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminRankingsPage;
