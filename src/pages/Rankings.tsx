
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RankingsPage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [demoRankings] = useState([
    { keyword: 'seo optimization', position: 3, change: 2 },
    { keyword: 'web design agency', position: 5, change: -1 },
    { keyword: 'digital marketing', position: 7, change: 0 },
    { keyword: 'content strategy', position: 12, change: 3 },
    { keyword: 'local seo', position: 15, change: -2 }
  ]);

  // Function to render change indicators
  const renderChange = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center">
          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-500">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center">
          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-red-500">{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <Minus className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-gray-500">0</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('pages', 'rankings')}</h1>

        {loading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : user ? (
          // Authenticated user view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t('pages', 'yourWebsiteRankings')}</CardTitle>
                <CardDescription>
                  {t('pages', 'rankingsTitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Keyword</th>
                        <th className="text-center py-3 px-4">Position</th>
                        <th className="text-center py-3 px-4">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoRankings.map((ranking, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <span className="font-medium">{ranking.keyword}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={ranking.position <= 10 ? "default" : "secondary"}>
                              #{ranking.position}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {renderChange(ranking.change)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => alert('This would export your ranking data')}
              >
                Export Report
              </Button>
              <Button 
                variant="default" 
                className="bg-rank-teal hover:bg-rank-teal/90"
                onClick={() => window.location.href = '/add-website'}
              >
                Track New Website
              </Button>
            </div>
          </div>
        ) : (
          // Guest view
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <h2 className="text-2xl font-semibold mb-4">{t('pages', 'monitorRankings')}</h2>
                  <p className="mb-6 text-muted-foreground">
                    Track how your keywords perform in search results and improve your SEO strategy.
                    Sign in to access detailed ranking reports for your websites.
                  </p>
                  <Button 
                    className="bg-rank-teal hover:bg-rank-teal/90"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In to View Rankings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t('pages', 'whyTrackRankings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Improve Visibility</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your position in search results to increase your website's visibility.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Track Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      See how your SEO efforts impact your search rankings over time.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Beat Competitors</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare your rankings with competitors and identify opportunities.
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

export default RankingsPage;
