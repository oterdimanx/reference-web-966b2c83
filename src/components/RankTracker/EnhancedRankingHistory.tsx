import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RankingSnapshot, getKeywordRankingHistory, triggerDeepSearch } from '@/services/rankingService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedRankingHistoryProps {
  websiteId: string;
  keywords: string[];
}

export const EnhancedRankingHistory = ({ websiteId, keywords }: EnhancedRankingHistoryProps) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [selectedEngine, setSelectedEngine] = useState<string>('google');
  const [rankings, setRankings] = useState<RankingSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggeringDeepSearch, setTriggeringDeepSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (keywords.length > 0 && !selectedKeyword) {
      setSelectedKeyword(keywords[0]);
    }
  }, [keywords]);

  useEffect(() => {
    if (selectedKeyword && websiteId) {
      loadRankingHistory();
    }
  }, [selectedKeyword, selectedEngine, websiteId]);

  const loadRankingHistory = async () => {
    if (!selectedKeyword) return;
    
    setLoading(true);
    try {
      const data = await getKeywordRankingHistory(websiteId, selectedKeyword, selectedEngine);
      setRankings(data);
    } catch (error) {
      console.error('Error loading ranking history:', error);
      toast({
        title: "Error",
        description: "Failed to load ranking history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDeepSearch = async () => {
    if (!selectedKeyword) return;

    setTriggeringDeepSearch(true);
    try {
      const success = await triggerDeepSearch(websiteId, selectedKeyword);
      if (success) {
        toast({
          title: "Deep Search Triggered",
          description: "Deep search has been initiated. Results will be available shortly.",
        });
        // Reload data after a short delay
        setTimeout(() => {
          loadRankingHistory();
        }, 2000);
      } else {
        throw new Error('Failed to trigger deep search');
      }
    } catch (error) {
      console.error('Error triggering deep search:', error);
      toast({
        title: "Error",
        description: "Failed to trigger deep search",
        variant: "destructive",
      });
    } finally {
      setTriggeringDeepSearch(false);
    }
  };

  const getPositionTrend = () => {
    if (rankings.length < 2) return null;
    
    const latest = rankings[rankings.length - 1];
    const previous = rankings[rankings.length - 2];
    
    if (!latest.position || !previous.position) return null;
    
    const change = previous.position - latest.position; // Positive means improvement
    
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  const chartData = rankings.map(r => ({
    date: new Date(r.snapshotDate).toLocaleDateString(),
    position: r.position || 101,
    confidence: r.rankingConfidence,
    searchDepth: r.searchDepth,
  }));

  const trend = getPositionTrend();
  const latestRanking = rankings[rankings.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enhanced Ranking History</CardTitle>
            <CardDescription>Track keyword rankings with confidence levels and search depths</CardDescription>
          </div>
          <Button
            onClick={handleTriggerDeepSearch}
            disabled={triggeringDeepSearch || !selectedKeyword}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {triggeringDeepSearch ? 'Searching...' : 'Deep Search'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                <SelectTrigger>
                  <SelectValue placeholder="Select keyword" />
                </SelectTrigger>
                <SelectContent>
                  {keywords.map(keyword => (
                    <SelectItem key={keyword} value={keyword}>
                      {keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {latestRanking && (
            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Latest Position:</span>
                <span className="font-semibold">
                  {latestRanking.position ? `#${latestRanking.position}` : 'Not found'}
                </span>
              </div>
              
              {trend && (
                <div className="flex items-center space-x-1">
                  {trend.type === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {trend.type === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {trend.type === 'same' && <Minus className="h-4 w-4 text-muted-foreground" />}
                  <span className={`text-sm ${
                    trend.type === 'up' ? 'text-green-500' : 
                    trend.type === 'down' ? 'text-red-500' : 
                    'text-muted-foreground'
                  }`}>
                    {trend.value > 0 ? `${trend.value} positions` : 'No change'}
                  </span>
                </div>
              )}

              <Badge variant="secondary">
                {latestRanking.rankingConfidence} confidence
              </Badge>
              
              <span className="text-xs text-muted-foreground">
                Searched {latestRanking.searchDepth} results
              </span>
            </div>
          )}

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-muted-foreground">Loading ranking history...</span>
            </div>
          ) : rankings.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[1, 101]} 
                    reversed={true}
                    tickFormatter={(value) => value === 101 ? 'Not found' : `#${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      value === 101 ? 'Not found' : `#${value}`,
                      'Position'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="position" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-muted-foreground">
                {selectedKeyword ? 'No ranking data available for this keyword' : 'Select a keyword to view history'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};