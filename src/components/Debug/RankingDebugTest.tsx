import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { triggerRankingCheck } from '@/services/rankingService';
import { useToast } from '@/hooks/use-toast';

export const RankingDebugTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerRanking = async () => {
    setIsLoading(true);
    try {
      // Test with the website ID from the database
      const success = await triggerRankingCheck('b0eb5923-70fe-43b4-b320-14f16d6e528f', '7saveurs');
      
      if (success) {
        toast({
          title: "Ranking Check Triggered",
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
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Ranking Debug Test</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This will trigger a ranking check for the '7saveurs' keyword to test the SerpAPI integration.
      </p>
      <Button 
        onClick={handleTriggerRanking} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Testing...' : 'Test Ranking Check'}
      </Button>
    </div>
  );
};