import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Plus, Trash2, Settings, Edit3, Check, X } from 'lucide-react';
import { keywordService } from '@/services/keywordService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KeywordManagerDialogProps {
  websiteId: string;
  websiteDomain: string;
  onKeywordsUpdated: () => void;
}

interface KeywordWithStatus {
  keyword: string;
  hasRankingRequests: boolean;
  rankingRequestsCount: number;
  rankingSnapshotsCount: number;
  hasUserPreferences: boolean;
}

export function KeywordManagerDialog({ websiteId, websiteDomain, onKeywordsUpdated }: KeywordManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentKeywords, setCurrentKeywords] = useState<KeywordWithStatus[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editKeywordValue, setEditKeywordValue] = useState('');
  const { toast } = useToast();

  const loadKeywords = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      const keywords = await keywordService.getWebsiteKeywords(websiteId);
      
      // Get status for each keyword
      const keywordsWithStatus = await Promise.all(
        keywords.map(async (keyword) => {
          const dependencies = await keywordService.getKeywordDependencies(websiteId, keyword);
          return {
            keyword,
            ...dependencies
          };
        })
      );
      
      setCurrentKeywords(keywordsWithStatus);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast({
        title: "Error",
        description: "Failed to load keywords",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
  }, [open, websiteId]);

  const handleAddKeyword = async () => {
    const keywords = newKeywordInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one keyword",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      for (const keyword of keywords) {
        await keywordService.addKeywordToWebsite(websiteId, keyword);
      }
      
      setNewKeywordInput('');
      await loadKeywords();
      onKeywordsUpdated();
      
      toast({
        title: "Success",
        description: `Added ${keywords.length} keyword(s) successfully`
      });
    } catch (error) {
      console.error('Error adding keywords:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add keywords",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    setRemoving(keyword);
    try {
      await keywordService.removeKeywordFromWebsite(websiteId, keyword);
      await loadKeywords();
      onKeywordsUpdated();
      
      toast({
        title: "Success",
        description: `Removed keyword "${keyword}" successfully`
      });
    } catch (error) {
      console.error('Error removing keyword:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove keyword",
        variant: "destructive"
      });
    } finally {
      setRemoving(null);
    }
  };

  const handleEditKeyword = (keyword: string) => {
    setEditingKeyword(keyword);
    setEditKeywordValue(keyword);
  };

  const handleSaveEditKeyword = async () => {
    if (!editingKeyword || !editKeywordValue.trim()) return;

    setLoading(true);
    try {
      await keywordService.updateKeywordInWebsite(websiteId, editingKeyword, editKeywordValue.trim());
      await loadKeywords();
      onKeywordsUpdated();
      
      toast({
        title: "Success",
        description: `Updated keyword "${editingKeyword}" to "${editKeywordValue.trim()}" successfully`
      });
      
      setEditingKeyword(null);
      setEditKeywordValue('');
    } catch (error) {
      console.error('Error updating keyword:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update keyword",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditKeyword = () => {
    setEditingKeyword(null);
    setEditKeywordValue('');
  };

  const getKeywordBadges = (keywordData: KeywordWithStatus) => {
    const badges = [];
    
    if (keywordData.hasRankingRequests) {
      badges.push(
        <Badge key="requests" variant="destructive" className="text-xs">
          <AlertTriangle size={12} className="mr-1" />
          Pending Requests
        </Badge>
      );
    }
    
    if (keywordData.rankingSnapshotsCount > 0) {
      badges.push(
        <Badge key="snapshots" variant="secondary" className="text-xs">
          {keywordData.rankingSnapshotsCount} Rankings
        </Badge>
      );
    }
    
    if (keywordData.hasUserPreferences) {
      badges.push(
        <Badge key="preferences" variant="outline" className="text-xs">
          <Settings size={12} className="mr-1" />
          Customized
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings size={16} className="mr-2" />
          Manage Keywords
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Keywords for {websiteDomain}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Current Keywords */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Keywords</h3>
              <p className="text-sm text-muted-foreground">
                Keywords with pending ranking requests cannot be edited or removed
              </p>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md p-4">
              {loading && currentKeywords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading keywords...
                </div>
              ) : currentKeywords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No keywords found for this website
                </div>
              ) : (
                <div className="space-y-3">
                  {currentKeywords.map((keywordData) => (
                    <div key={keywordData.keyword} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        {editingKeyword === keywordData.keyword ? (
                          <div className="space-y-2">
                            <Input
                              value={editKeywordValue}
                              onChange={(e) => setEditKeywordValue(e.target.value)}
                              className="font-medium"
                              placeholder="Enter keyword"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEditKeyword}
                                disabled={loading || !editKeywordValue.trim()}
                                className="text-green-600 hover:text-green-600 hover:bg-green-50"
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditKeyword}
                                disabled={loading}
                                className="text-gray-600 hover:text-gray-600 hover:bg-gray-50"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium mb-2">{keywordData.keyword}</div>
                            <div className="flex flex-wrap gap-1">
                              {getKeywordBadges(keywordData)}
                            </div>
                          </>
                        )}
                      </div>
                      {editingKeyword !== keywordData.keyword && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditKeyword(keywordData.keyword)}
                            disabled={keywordData.hasRankingRequests || loading}
                            className="text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKeyword(keywordData.keyword)}
                            disabled={keywordData.hasRankingRequests || removing === keywordData.keyword || loading}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Add New Keywords */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Add New Keywords</h3>
              <p className="text-sm text-muted-foreground">
                Enter keywords separated by commas
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <textarea
                  id="keywords"
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                  placeholder="keyword1, keyword2, keyword3..."
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                />
              </div>
              
              <Button
                onClick={handleAddKeyword}
                disabled={loading || !newKeywordInput.trim()}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add Keywords
              </Button>
              
              <Alert>
                <AlertTriangle size={16} />
                <AlertDescription>
                  New keywords will be added to your website's keyword list. 
                  You can request ranking updates for them from the Keywords page.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}