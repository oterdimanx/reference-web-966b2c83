import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { KeywordDifficultyBadge } from './KeywordDifficultyBadge';
import { KeywordRankingStatus } from './KeywordRankingStatus';
import { KeywordGroupBadge } from './KeywordGroupBadge';
import { KeywordTagBadge } from './KeywordTagBadge';
import { KeywordManagerDialog } from './KeywordManagerDialog';
import { ExportDialog } from './ExportDialog';
import { KeywordFilterPanel, KeywordFilters } from './KeywordFilterPanel';
import { BulkActionToolbar } from './BulkActionToolbar';
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
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<KeywordFilters>({
    search: '',
    tags: [],
    group: null,
    priority: 'all',
    position: 'all'
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{name: string, color?: string}[]>([]);

  useEffect(() => {
    if (user) {
      loadKeywords();
      loadFilterOptions();
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

  const loadFilterOptions = async () => {
    if (!user) return;
    
    try {
      const [tags, groups] = await Promise.all([
        keywordService.getUserTags(user.id),
        keywordService.getUserGroups(user.id)
      ]);
      setAvailableTags(tags);
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleRequestRanking = async (websiteId: string, keyword: string) => {
    if (!user) return;
    
    try {
      const requestKey = `${websiteId}-${keyword}`;
      setPendingRequests(prev => new Set([...prev, requestKey]));
      
      await rankingRequestService.createRankingRequest(user.id, websiteId, keyword, 2);
      
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
      
      const keywordsByWebsite = keywords.reduce((acc, kw) => {
        if (!acc[kw.website_id]) acc[kw.website_id] = [];
        acc[kw.website_id].push(kw.keyword);
        return acc;
      }, {} as Record<string, string[]>);
      
      const requests = Object.entries(keywordsByWebsite).map(([websiteId, websiteKeywords]) =>
        rankingRequestService.createBulkRankingRequests(user.id, websiteId, websiteKeywords, 1)
      );
      
      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
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

  const applyFilters = (kw: UserKeyword) => {
    // Search filter
    if (filters.search && !kw.keyword.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Tag filter
    if (filters.tags.length > 0) {
      const keywordTags = kw.preferences?.tags || [];
      if (!filters.tags.some(tag => keywordTags.includes(tag))) {
        return false;
      }
    }
    
    // Group filter
    if (filters.group && kw.preferences?.group_name !== filters.group) {
      return false;
    }
    
    // Priority filter
    if (filters.priority === 'priority' && !kw.is_priority) return false;
    if (filters.priority === 'non-priority' && kw.is_priority) return false;
    
    // Position filter
    if (filters.position !== 'all') {
      const pos = kw.latest_position;
      if (filters.position === 'top-10' && (!pos || pos > 10)) return false;
      if (filters.position === 'top-30' && (!pos || pos > 30)) return false;
      if (filters.position === 'unranked' && pos) return false;
    }
    
    return true;
  };

  const filteredKeywords = keywords.filter(applyFilters);

  const handleKeywordSelection = (keywordKey: string, checked: boolean) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(keywordKey);
      } else {
        newSet.delete(keywordKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = filteredKeywords.map(kw => `${kw.website_id}-${kw.keyword}`);
      setSelectedKeywords(new Set(allKeys));
    } else {
      setSelectedKeywords(new Set());
    }
  };

  const handleBulkAssignGroup = async (groupName: string, groupColor?: string) => {
    if (!user) return;
    
    try {
      const updates = Array.from(selectedKeywords).map(key => {
        const [websiteId, keyword] = key.split('-', 2);
        return { websiteId, keyword, groupName, groupColor };
      });
      
      await keywordService.bulkUpdateKeywordGroups(user.id, updates);
      await loadKeywords();
      setSelectedKeywords(new Set());
      
      toast({
        title: "Group Assigned",
        description: `${updates.length} keywords assigned to "${groupName}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign group to keywords.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAssignTags = async (tags: string[]) => {
    if (!user) return;
    
    try {
      const updates = Array.from(selectedKeywords).map(key => {
        const [websiteId, keyword] = key.split('-', 2);
        return { websiteId, keyword, tags };
      });
      
      await keywordService.bulkUpdateKeywordTags(user.id, updates);
      await loadKeywords();
      setSelectedKeywords(new Set());
      
      toast({
        title: "Tags Assigned",
        description: `Tags assigned to ${updates.length} keywords.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign tags to keywords.",
        variant: "destructive",
      });
    }
  };

  const handleCreateGroup = async (groupName: string, groupColor: string) => {
    setAvailableGroups(prev => [...prev, { name: groupName, color: groupColor }]);
  };

  const allSelected = filteredKeywords.length > 0 && selectedKeywords.size === filteredKeywords.length;
  const someSelected = selectedKeywords.size > 0 && selectedKeywords.size < filteredKeywords.length;

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
    <div className="space-y-4">
      {/* Filter Panel */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-grow max-w-md">
                <Input
                  type="text"
                  placeholder="Search keywords..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedWebsiteId && (
                <KeywordManagerDialog
                  websiteId={selectedWebsiteId}
                  websiteDomain={keywords[0]?.website_domain || 'Website'}
                  onKeywordsUpdated={loadKeywords}
                />
              )}
              
              <ExportDialog 
                keywords={filteredKeywords}
                selectedWebsiteId={selectedWebsiteId}
              />
              
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
        </div>

        {showFilters && (
          <KeywordFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            className="w-80"
          />
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedKeywords={Array.from(selectedKeywords)}
        availableGroups={availableGroups}
        availableTags={availableTags}
        onDeselectAll={() => setSelectedKeywords(new Set())}
        onBulkAssignGroup={handleBulkAssignGroup}
        onBulkAssignTags={handleBulkAssignTags}
        onCreateGroup={handleCreateGroup}
      />

      {/* Keywords Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4">Keyword</th>
              <th className="text-center py-3 px-4">Website</th>
              <th className="text-center py-3 px-4">Group</th>
              <th className="text-center py-3 px-4">Tags</th>
              <th className="text-center py-3 px-4">Volume</th>
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
              const isSelected = selectedKeywords.has(requestKey);
              
              return (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleKeywordSelection(requestKey, checked as boolean)}
                    />
                  </td>
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
                    <KeywordGroupBadge 
                      groupName={keyword.preferences?.group_name}
                      groupColor={keyword.preferences?.group_color}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {keyword.preferences?.tags?.map(tag => (
                        <KeywordTagBadge key={tag} tag={tag} />
                      ))}
                    </div>
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
      
      {filteredKeywords.length === 0 && keywords.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No keywords match the current filters.
          </p>
        </div>
      )}
    </div>
  );
};