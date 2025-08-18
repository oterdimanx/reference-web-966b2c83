
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { KeywordDifficultyBadge } from './KeywordDifficultyBadge';
import { KeywordRankingStatus } from './KeywordRankingStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { keywordService, UserKeyword } from '@/services/keywordService';
import { rankingRequestService } from '@/services/rankingRequestService';
import { useToast } from '@/hooks/use-toast';

interface KeywordTableProps {
  selectedWebsiteId?: string;
}

export const KeywordTable = ({ selectedWebsiteId }: KeywordTableProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [keywords, setKeywords] = useState<UserKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [requestingAll, setRequestingAll] = useState(false);

  useEffect(() => {
    if (user) {
      loadKeywords();
    }
  }, [user, selectedWebsiteId]);

  const loadKeywords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userKeywords = await keywordService.getUserKeywords(user.id);
      
      // Filter by selected website if specified
      const filteredKeywords = selectedWebsiteId 
        ? userKeywords.filter(k => k.website_id === selectedWebsiteId)
        : userKeywords;
      
      setKeywords(filteredKeywords);
      
      // Load pending requests
      const pending = await rankingRequestService.getUserPendingRequests(user.id);
      const pendingSet = new Set(
        pending
          .filter(req => !selectedWebsiteId || req.website_id === selectedWebsiteId)
          .map(req => `${req.website_id}-${req.keyword}`)
      );
      setPendingRequests(pendingSet);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast({
        title: "Error",
        description: "Failed to load keywords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRanking = async (websiteId: string, keyword: string) => {
    if (!user) return;
    
    try {
      const requestKey = `${websiteId}-${keyword}`;
      setPendingRequests(prev => new Set([...prev, requestKey]));
      
      await rankingRequestService.createRankingRequest(user.id, websiteId, keyword, 2); // Higher priority for manual requests
      
      toast({
        title: "Ranking Check Requested",
        description: `Ranking update for "${keyword}" has been queued.`,
      });
    } catch (error: any) {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${websiteId}-${keyword}`);
        return newSet;
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to request ranking update.",
        variant: "destructive",
      });
    }
  };

  const handleRequestAllRankings = async () => {
    if (!user || keywords.length === 0) return;
    
    try {
      setRequestingAll(true);
      
      // Group keywords by website
      const keywordsByWebsite = keywords.reduce((acc, kw) => {
        if (!acc[kw.website_id]) acc[kw.website_id] = [];
        acc[kw.website_id].push(kw.keyword);
        return acc;
      }, {} as Record<string, string[]>);
      
      // Create bulk requests for each website
      const requests = Object.entries(keywordsByWebsite).map(([websiteId, websiteKeywords]) =>
        rankingRequestService.createBulkRankingRequests(user.id, websiteId, websiteKeywords, 1)
      );
      
      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      // Update pending requests
      const allPendingKeys = keywords.map(kw => `${kw.website_id}-${kw.keyword}`);
      setPendingRequests(new Set(allPendingKeys));
      
      toast({
        title: "Ranking Checks Requested",
        description: `${successful} ranking update requests have been queued.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request ranking updates.",
        variant: "destructive",
      });
    } finally {
      setRequestingAll(false);
    }
  };

  const filteredKeywords = keywords.filter(kw => 
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Keywords Found</h3>
        <p className="text-muted-foreground">
          Add keywords to your websites to start tracking rankings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10"
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleRequestAllRankings}
            disabled={requestingAll || keywords.length === 0}
          >
            {requestingAll ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Requesting...
              </>
            ) : (
              'Update All Rankings'
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Keyword</th>
              <th className="text-center py-3 px-4">Website</th>
              <th className="text-center py-3 px-4">Search Volume</th>
              <th className="text-center py-3 px-4">Difficulty</th>
              <th className="text-center py-3 px-4">Ranking</th>
              <th className="text-center py-3 px-4">Change</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.map((keyword, index) => {
              const requestKey = `${keyword.website_id}-${keyword.keyword}`;
              const isPending = pendingRequests.has(requestKey);
              
              return (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{keyword.keyword}</span>
                      {keyword.is_priority && (
                        <Badge variant="secondary" className="text-xs">Priority</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-muted-foreground">{keyword.website_domain}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {keyword.volume_estimate || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <KeywordDifficultyBadge difficulty={keyword.difficulty_estimate || 'Unknown'} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <KeywordRankingStatus ranking={keyword.latest_position} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {keyword.position_change !== null && (
                      <Badge 
                        variant={keyword.position_change > 0 ? "default" : keyword.position_change < 0 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {keyword.position_change > 0 ? '+' : ''}{keyword.position_change}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestRanking(keyword.website_id, keyword.keyword)}
                      disabled={isPending}
                      className="text-xs"
                    >
                      {isPending ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredKeywords.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No keywords found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};
