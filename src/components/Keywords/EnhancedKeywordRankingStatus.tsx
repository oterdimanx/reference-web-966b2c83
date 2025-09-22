import { CheckCircle, XCircle, Info, Search, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedKeywordRankingStatusProps {
  ranking: number | null;
  confidence: string;
  searchDepth: number;
  isPriority: boolean;
  onTogglePriority?: () => void;
  onTriggerDeepSearch?: () => void;
  canTriggerDeepSearch?: boolean;
}

export const EnhancedKeywordRankingStatus = ({ 
  ranking, 
  confidence, 
  searchDepth, 
  isPriority,
  onTogglePriority,
  onTriggerDeepSearch,
  canTriggerDeepSearch = false
}: EnhancedKeywordRankingStatusProps) => {
  const getStatusIcon = () => {
    if (ranking === null) {
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    } else if (ranking <= 10) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (ranking <= 100) {
      return <Info className="h-4 w-4 text-blue-500" />;
    } else {
      return <Search className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusText = () => {
    if (ranking === null) {
      return `Not found in top ${searchDepth}`;
    } else if (ranking <= 100) {
      return `#${ranking}`;
    } else {
      return `#${ranking}`;
    }
  };

  const getStatusColor = () => {
    if (ranking === null) return 'text-muted-foreground';
    if (ranking <= 10) return 'text-green-500';
    if (ranking <= 100) return 'text-blue-500';
    return 'text-orange-500';
  };

  const getConfidenceBadge = () => {
    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'outline',
      none: 'destructive'
    } as const;

    const labels = {
      high: 'High confidence',
      medium: 'Medium confidence', 
      low: 'Low confidence',
      none: 'Not found'
    };

    return (
      <Badge variant={variants[confidence as keyof typeof variants] || 'outline'} className="text-xs">
        {labels[confidence as keyof typeof labels] || confidence}
      </Badge>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
      
      {getConfidenceBadge()}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-muted-foreground">
              (searched {searchDepth})
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Searched top {searchDepth} results</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onTogglePriority && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePriority}
                className={isPriority ? 'text-yellow-500' : 'text-muted-foreground'}
              >
                <Star className={`h-3 w-3 ${isPriority ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPriority ? 'Remove from priority' : 'Mark as priority'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {canTriggerDeepSearch && onTriggerDeepSearch && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onTriggerDeepSearch}
                className="text-purple-500"
              >
                <Zap className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Trigger deep search (up to 300 results)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};