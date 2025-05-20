
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const KeywordsPage = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [demoKeywords] = useState([
    { keyword: 'seo optimization', volume: 'High', difficulty: 'Medium', ranking: 3 },
    { keyword: 'web design agency', volume: 'Medium', difficulty: 'Low', ranking: 5 },
    { keyword: 'digital marketing', volume: 'Very High', difficulty: 'High', ranking: 7 },
    { keyword: 'content strategy', volume: 'Medium', difficulty: 'Medium', ranking: 12 },
    { keyword: 'local seo', volume: 'High', difficulty: 'Low', ranking: 15 },
    { keyword: 'responsive design', volume: 'Medium', difficulty: 'Low', ranking: null },
    { keyword: 'website analytics', volume: 'Medium', difficulty: 'Medium', ranking: null }
  ]);

  const filteredKeywords = demoKeywords.filter(kw => 
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to render difficulty badges
  const renderDifficulty = (difficulty: string) => {
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

  // Function to render ranking status
  const renderRankingStatus = (ranking: number | null) => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Keywords</h1>

        {loading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : user ? (
          // Authenticated user view
          <div className="space-y-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Your Keywords</CardTitle>
                <CardDescription>
                  Track and manage keywords for your websites
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            {renderDifficulty(keyword.difficulty)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {renderRankingStatus(keyword.ranking)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Guest view
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <h2 className="text-2xl font-semibold mb-4">Optimize Your Keyword Strategy</h2>
                  <p className="mb-6 text-muted-foreground">
                    Track keyword performance, discover new opportunities, and boost your search rankings.
                    Sign in to manage your keyword portfolio.
                  </p>
                  <Button 
                    className="bg-rank-teal hover:bg-rank-teal/90"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In to Manage Keywords
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Why Keyword Research Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Find Opportunities</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover high-value keywords with lower competition that can drive targeted traffic.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Understand Intent</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn what your potential customers are searching for and align content accordingly.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Measure Success</h3>
                    <p className="text-sm text-muted-foreground">
                      Track ranking progress over time to see what's working and what needs improvement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KeywordsPage;
