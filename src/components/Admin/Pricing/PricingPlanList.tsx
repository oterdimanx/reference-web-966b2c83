
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import PricingPlanCard from './PricingPlanCard';
import { usePricingPlans, PricingPlan } from '@/hooks/use-pricing-plans';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PricingPlanList = () => {
  const { user, isAdmin } = useAuth();
  const { pricingPlans, isLoading, error } = usePricingPlans(user?.id, isAdmin);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-slate-100"></CardHeader>
            <CardContent className="h-32 bg-slate-50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pricing plans: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!pricingPlans || pricingPlans.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No pricing plans found. Create your first plan using the button above.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pricingPlans.map((plan: PricingPlan) => (
        <PricingPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

export default PricingPlanList;
