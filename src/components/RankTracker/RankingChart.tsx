
import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RankingData } from '@/lib/mockData';

interface RankingChartProps {
  data: RankingData[];
  selectedKeyword?: string;
}

export function RankingChart({ data, selectedKeyword }: RankingChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Filter data to only the selected keyword if specified
    const filteredData = selectedKeyword 
      ? data.filter(d => d.keyword === selectedKeyword)
      : data;
    
    if (filteredData.length === 0) return [];
    
    // Get all unique dates from all keywords
    const allDates = new Set<string>();
    filteredData.forEach(dataItem => {
      dataItem.rankings.forEach(rank => allDates.add(rank.date));
    });
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort();
    
    // Create chart data with all keywords
    return sortedDates.map(date => {
      const dataPoint: { date: string; [key: string]: any } = { date };
      
      filteredData.forEach(dataItem => {
        const ranking = dataItem.rankings.find(r => r.date === date);
        if (ranking) {
          // Position is inverted so that higher on chart = better ranking
          dataPoint[dataItem.keyword] = ranking.position;
        }
      });
      
      return dataPoint;
    });
  }, [data, selectedKeyword]);
  
  // Colors for the lines
  const lineColors = ['#3B82F6', '#0D9488', '#059669', '#6366F1', '#8B5CF6'];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedKeyword ? `Rankings for "${selectedKeyword}"` : 'Keyword Rankings'}
        </CardTitle>
        <CardDescription>
          {selectedKeyword 
            ? 'Position changes over time for the selected keyword'
            : 'Position changes over time for all tracked keywords'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis 
                  reversed // Higher position = better ranking (lower number)
                  stroke="#888888"
                  fontSize={12}
                  domain={[1, 101]}
                  label={{ 
                    value: 'Position', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#888888', fontSize: 12 }
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => [value === 101 ? 'Not in top 100 (101)' : `Position: ${value}`, '']}
                  labelFormatter={formatDate}
                />
                <Legend />
                {data
                  .filter(d => !selectedKeyword || d.keyword === selectedKeyword)
                  .map((dataItem, index) => (
                    <Line
                      key={dataItem.keyword}
                      type="monotone"
                      dataKey={dataItem.keyword}
                      stroke={lineColors[index % lineColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No ranking data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
