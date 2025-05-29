
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { RankingSnapshot, fetchWebsiteRankings, triggerRankingCheck } from '@/services/rankingService';

interface RankingHistoryProps {
  websiteId: string;
  websiteDomain: string;
}

export function RankingHistory({ websiteId, websiteDomain }: RankingHistoryProps) {
  const [rankings, setRankings] = useState<RankingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRankings = async () => {
    try {
      const data = await fetchWebsiteRankings(websiteId);
      setRankings(data);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error('Failed to load ranking data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRankings = async () => {
    setRefreshing(true);
    try {
      const success = await triggerRankingCheck(websiteId);
      if (success) {
        toast.success('Ranking check started! Results will appear shortly.');
        // Reload rankings after a short delay
        setTimeout(() => {
          loadRankings();
        }, 5000);
      } else {
        toast.error('Failed to start ranking check');
      }
    } catch (error) {
      console.error('Error refreshing rankings:', error);
      toast.error('Failed to refresh rankings');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [websiteId]);

  const renderPositionBadge = (position: number | null) => {
    if (!position) {
      return <Badge variant="secondary">Not Found</Badge>;
    }

    if (position <= 3) {
      return <Badge className="bg-green-500">#{position}</Badge>;
    } else if (position <= 10) {
      return <Badge className="bg-yellow-500">#{position}</Badge>;
    } else {
      return <Badge variant="secondary">#{position}</Badge>;
    }
  };

  const renderSearchEngineIcon = (engine: string) => {
    switch (engine.toLowerCase()) {
      case 'google':
        return '🔍';
      case 'bing':
        return '🅱️';
      default:
        return '🔎';
    }
  };

  const groupedRankings = rankings.reduce((acc, ranking) => {
    const key = `${ranking.keyword}-${ranking.searchEngine}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(ranking);
    return acc;
  }, {} as Record<string, RankingSnapshot[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ranking History - {websiteDomain}</CardTitle>
        <Button 
          onClick={handleRefreshRankings} 
          disabled={refreshing}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking...' : 'Check Rankings'}
        </Button>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No ranking data available yet. Click "Check Rankings" to start tracking.
            </p>
            <Button onClick={handleRefreshRankings} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Start Tracking
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedRankings).map(([key, keywordRankings]) => {
              const [keyword, searchEngine] = key.split('-');
              const latestRanking = keywordRankings[0];
              const previousRanking = keywordRankings[1];
              
              let trend = null;
              if (latestRanking.position && previousRanking?.position) {
                const change = previousRanking.position - latestRanking.position;
                if (change > 0) {
                  trend = <TrendingUp className="h-4 w-4 text-green-500" />;
                } else if (change < 0) {
                  trend = <TrendingDown className="h-4 w-4 text-red-500" />;
                } else {
                  trend = <Minus className="h-4 w-4 text-gray-500" />;
                }
              }

              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{renderSearchEngineIcon(searchEngine)}</span>
                    <div>
                      <p className="font-medium">{keyword}</p>
                      <p className="text-sm text-muted-foreground">
                        Last checked: {new Date(latestRanking.snapshotDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {trend}
                    {renderPositionBadge(latestRanking.position)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
