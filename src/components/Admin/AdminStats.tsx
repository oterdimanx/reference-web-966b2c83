
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminStatsProps {
  usersCount: number | undefined;
  websitesCount: number | undefined;
  loading: boolean;
}

export function AdminStats({ usersCount, websitesCount, loading }: AdminStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin', 'totalUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{loading ? '...' : usersCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('admin', 'totalWebsites')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{loading ? '...' : websitesCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('admin', 'pricingPlans')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">2</p>
        </CardContent>
      </Card>
    </div>
  );
}
