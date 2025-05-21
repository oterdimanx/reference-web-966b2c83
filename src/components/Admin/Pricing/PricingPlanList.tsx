
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import PricingPlanCard from './PricingPlanCard';
import { usePricingPlans, PricingPlan } from '@/hooks/use-pricing-plans';
import { useAuth } from '@/contexts/AuthContext';

const PricingPlanList = () => {
  const { user, isAdmin } = useAuth();
  const { pricingPlans, isLoading } = usePricingPlans(user?.id, isAdmin);
  
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pricingPlans?.map((plan: PricingPlan) => (
        <PricingPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

export default PricingPlanList;
