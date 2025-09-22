import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { triggerRankingCheck } from '@/services/rankingService';
import { useToast } from '@/hooks/use-toast';

export const RankingDebugTest = () => {
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const { toast } = useToast();

  const handleTriggerSingleRanking = async () => {
    setIsLoadingSingle(true);
    try {
      // Test with the website ID from the database
      const success = await triggerRankingCheck('b0eb5923-70fe-43b4-b320-14f16d6e528f', '7saveurs');
      
      if (success) {
        toast({
          title: "Single Ranking Check Triggered",
          description: "Check the console logs and database for results.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to trigger ranking check. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Exception occurred during ranking check.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const handleTriggerAllRankings = async () => {
    setIsLoadingAll(true);
    try {
      // Trigger ranking check for all keywords (no specific keyword)
      const success = await triggerRankingCheck('b0eb5923-70fe-43b4-b320-14f16d6e528f');
      
      if (success) {
        toast({
          title: "All Rankings Check Triggered",
          description: "Checking all keywords for the website. Check logs for progress.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to trigger all rankings check. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Exception occurred during all rankings check.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Ranking Debug Test</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Test the SerpAPI integration with single keyword or all keywords.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={handleTriggerSingleRanking} 
          disabled={isLoadingSingle || isLoadingAll}
          className="w-full"
          variant="outline"
        >
          {isLoadingSingle ? 'Testing Single...' : 'Test Single Keyword (7saveurs)'}
        </Button>
        <Button 
          onClick={handleTriggerAllRankings} 
          disabled={isLoadingSingle || isLoadingAll}
          className="w-full"
        >
          {isLoadingAll ? 'Testing All...' : 'Test All Keywords'}
        </Button>
      </div>
    </div>
  );
};