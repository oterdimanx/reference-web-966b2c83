
import { Badge } from '@/components/ui/badge';

interface KeywordDifficultyBadgeProps {
  difficulty: string;
}

export const KeywordDifficultyBadge = ({ difficulty }: KeywordDifficultyBadgeProps) => {
  switch(difficulty) {
    case 'Low':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    case 'Medium':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
    case 'High':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
    case 'Very High':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Very High</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
