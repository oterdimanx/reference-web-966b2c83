
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KeywordTable } from './KeywordTable';
import { useLanguage } from '@/contexts/LanguageContext';

export const AuthenticatedView = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{t('pages', 'yourKeywords')}</CardTitle>
          <CardDescription>
            {t('pages', 'keywordsTitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeywordTable />
        </CardContent>
      </Card>
    </div>
  );
};
