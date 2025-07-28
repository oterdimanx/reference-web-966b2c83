
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
              {t('pages', 'trackKeywordsText')}
            </p>
            <Button 
              className="bg-rank-teal hover:bg-rank-teal/90"
              onClick={() => window.location.href = '/auth'}
            >
              {t('pages', 'signInKeywordsManageButton')}
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
              <h3 className="font-semibold mb-2">{t('pages', 'FindOpportunitiesKeywords')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('pages', 'opportunitiesKeywordsText')}
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{t('pages', 'UnderstandIntendKeywords')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('pages', 'understandIntentKeywordsText')}
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{t('pages', 'measureSuccessKeywords')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('pages', 'measureSuccessKeywordsText')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
