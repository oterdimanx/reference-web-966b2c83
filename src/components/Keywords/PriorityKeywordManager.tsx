import { useState, useEffect } from 'react';
import { Star, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getKeywordPreferences, toggleKeywordPriority, toggleDeepSearch, KeywordPreference } from '@/services/rankingService';

interface PriorityKeywordManagerProps {
  websiteId: string;
  keywords: string[];
}

export const PriorityKeywordManager = ({ websiteId, keywords }: PriorityKeywordManagerProps) => {
  const [preferences, setPreferences] = useState<KeywordPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, [websiteId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await getKeywordPreferences(websiteId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading keyword preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load keyword preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePriority = async (keyword: string, isPriority: boolean) => {
    try {
      const success = await toggleKeywordPriority(websiteId, keyword, isPriority);
      if (success) {
        await loadPreferences();
        toast({
          title: "Success",
          description: `Keyword ${isPriority ? 'marked as priority' : 'removed from priority'}`,
        });
      } else {
        throw new Error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: "Error",
        description: "Failed to update keyword priority",
        variant: "destructive",
      });
    }
  };

  const handleToggleDeepSearch = async (keyword: string, enabled: boolean) => {
    try {
      const success = await toggleDeepSearch(websiteId, keyword, enabled);
      if (success) {
        await loadPreferences();
        toast({
          title: "Success",
          description: `Deep search ${enabled ? 'enabled' : 'disabled'} for keyword`,
        });
      } else {
        throw new Error('Failed to update deep search setting');
      }
    } catch (error) {
      console.error('Error updating deep search:', error);
      toast({
        title: "Error",
        description: "Failed to update deep search setting",
        variant: "destructive",
      });
    }
  };

  const getKeywordPreference = (keyword: string): KeywordPreference | undefined => {
    return preferences.find(p => p.keyword === keyword);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Priority Keywords
          </CardTitle>
          <CardDescription>Configure priority keywords and deep search settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Priority Keywords
        </CardTitle>
        <CardDescription>
          Priority keywords get deeper search (up to 300 results) and more frequent updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keywords.map(keyword => {
            const pref = getKeywordPreference(keyword);
            const isPriority = pref?.isPriority || false;
            const deepSearchEnabled = pref?.deepSearchEnabled || false;
            const lastDeepSearch = pref?.lastDeepSearchAt;

            return (
              <div key={keyword} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePriority(keyword, !isPriority)}
                    className={isPriority ? 'text-yellow-500' : 'text-muted-foreground'}
                  >
                    <Star className={`h-4 w-4 ${isPriority ? 'fill-current' : ''}`} />
                  </Button>
                  <span className="font-medium">{keyword}</span>
                  {isPriority && <Badge variant="secondary">Priority</Badge>}
                  {deepSearchEnabled && <Badge variant="outline">Deep Search</Badge>}
                </div>
                
                <div className="flex items-center space-x-4">
                  {lastDeepSearch && (
                    <div className="text-xs text-muted-foreground">
                      Last deep search: {new Date(lastDeepSearch).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      checked={deepSearchEnabled}
                      onCheckedChange={(enabled) => handleToggleDeepSearch(keyword, enabled)}
                    />
                    <Label htmlFor={`deep-search-${keyword}`} className="text-sm">
                      Deep Search
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
          
          {keywords.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No keywords configured for this website
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};