
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface KeywordRankingStatusProps {
  ranking: number | null;
}

export const KeywordRankingStatus = ({ ranking }: KeywordRankingStatusProps) => {
  if (ranking === null) {
    return (
      <div className="flex items-center">
        <XCircle className="h-4 w-4 text-gray-400 mr-1" />
        <span className="text-gray-400">Not Ranked</span>
      </div>
    );
  } else if (ranking <= 10) {
    return (
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-500">#{ranking}</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center">
        <Info className="h-4 w-4 text-blue-500 mr-1" />
        <span className="text-blue-500">#{ranking}</span>
      </div>
    );
  }
};
