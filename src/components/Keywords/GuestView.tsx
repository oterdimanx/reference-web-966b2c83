
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const GuestView = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4">{t('pages', 'optimizeKeywords')}</h2>
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
          <CardTitle className="text-xl">{t('pages', 'whyKeywordResearch')}</CardTitle>
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
  );
};
