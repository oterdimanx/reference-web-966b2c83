
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeywordDifficultyBadge } from './KeywordDifficultyBadge';
import { KeywordRankingStatus } from './KeywordRankingStatus';
import { useLanguage } from '@/contexts/LanguageContext';

interface Keyword {
  keyword: string;
  volume: string;
  difficulty: string;
  ranking: number | null;
}

export const KeywordTable = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [keywords] = useState<Keyword[]>([
    { keyword: 'seo optimization', volume: 'High', difficulty: 'Medium', ranking: 3 },
    { keyword: 'web design agency', volume: 'Medium', difficulty: 'Low', ranking: 5 },
    { keyword: 'digital marketing', volume: 'Very High', difficulty: 'High', ranking: 7 },
    { keyword: 'content strategy', volume: 'Medium', difficulty: 'Medium', ranking: 12 },
    { keyword: 'local seo', volume: 'High', difficulty: 'Low', ranking: 15 },
    { keyword: 'responsive design', volume: 'Medium', difficulty: 'Low', ranking: null },
    { keyword: 'website analytics', volume: 'Medium', difficulty: 'Medium', ranking: null }
  ]);

  const filteredKeywords = keywords.filter(kw => 
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="bg-rank-teal hover:bg-rank-teal/90"
            onClick={() => alert('This would open a modal to add new keywords')}
          >
            Add Keywords
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Keyword</th>
              <th className="text-center py-3 px-4">Search Volume</th>
              <th className="text-center py-3 px-4">Difficulty</th>
              <th className="text-center py-3 px-4">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.map((keyword, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">
                  <span className="font-medium">{keyword.keyword}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  {keyword.volume}
                </td>
                <td className="py-3 px-4 text-center">
                  <KeywordDifficultyBadge difficulty={keyword.difficulty} />
                </td>
                <td className="py-3 px-4 text-center">
                  <KeywordRankingStatus ranking={keyword.ranking} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
