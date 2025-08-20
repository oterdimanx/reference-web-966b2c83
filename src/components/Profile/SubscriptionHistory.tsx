
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { subscriptionService, SubscriptionHistory } from '@/services/subscriptionService';
import { format } from 'date-fns';

export const SubscriptionHistoryCard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const { data: subscriptionHistory, isLoading } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: () => subscriptionService.getSubscriptionHistory(user?.id || ''),
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription History</CardTitle>
        <CardDescription>
          Your subscription history and current plan details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!subscriptionHistory || subscriptionHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No subscription history found.
          </p>
        ) : (
          <div className="space-y-4">
            {subscriptionHistory.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{subscription.pricing.title}</h4>
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusLabel(subscription.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Started: {format(new Date(subscription.started_at), 'MMM dd, yyyy')}
                    </p>
                    {subscription.ended_at && (
                      <p>
                        Ended: {format(new Date(subscription.ended_at), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    €{subscription.pricing.price}
                    {language === 'fr' && subscription.pricing.frequency_fr 
                      ? subscription.pricing.frequency_fr 
                      : subscription.pricing.frequency_en || '/month'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
