
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RankingSummary } from '@/lib/mockData';

interface WebsiteListProps {
  websites: RankingSummary[];
  onSelectWebsite: (websiteId: string) => void;
  selectedWebsiteId?: string;
}

export function WebsiteList({ websites, onSelectWebsite, selectedWebsiteId }: WebsiteListProps) {
  const [sortBy, setSortBy] = useState<'domain' | 'position' | 'change'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedWebsites = [...websites].sort((a, b) => {
    if (sortBy === 'domain') {
      return sortOrder === 'asc' 
        ? a.domain.localeCompare(b.domain)
        : b.domain.localeCompare(a.domain);
    } else if (sortBy === 'position') {
      return sortOrder === 'asc' 
        ? a.avgPosition - b.avgPosition
        : b.avgPosition - a.avgPosition;
    } else { // change
      return sortOrder === 'asc' 
        ? a.change - b.change
        : b.change - a.change;
    }
  });

  const toggleSort = (column: 'domain' | 'position' | 'change') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (column: 'domain' | 'position' | 'change') => {
    if (sortBy !== column) return null;
    
    return sortOrder === 'asc' 
      ? <span className="ml-1">↑</span>
      : <span className="ml-1">↓</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked Websites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => toggleSort('domain')}
                    className="font-medium text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Website {getSortIndicator('domain')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort('position')}
                    className="font-medium text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Avg Position {getSortIndicator('position')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort('change')}
                    className="font-medium text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Change {getSortIndicator('change')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Keywords
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedWebsites.length > 0 ? (
                sortedWebsites.map(website => (
                  <tr 
                    key={website.websiteId}
                    className={`${
                      selectedWebsiteId === website.websiteId 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    } cursor-pointer transition-colors`}
                    onClick={() => onSelectWebsite(website.websiteId)}
                  >
                    <td className="px-4 py-3 font-medium">{website.domain}</td>
                    <td className="px-4 py-3">#{website.avgPosition}</td>
                    <td className="px-4 py-3">
                      {website.change > 0 ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 inline mr-1" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          {website.change}
                        </span>
                      ) : website.change < 0 ? (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {Math.abs(website.change)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{website.keywordCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No websites found. Add a website to start tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardContent>
    </Card>
  );
}
