
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { PricingPlan, usePricingPlans } from '@/hooks/use-pricing-plans';
import PricingPlanEditDialog from './PricingPlanEditDialog';
import PricingPlanDeleteDialog from './PricingPlanDeleteDialog';
import { useAuth } from '@/contexts/AuthContext';

interface PricingPlanCardProps {
  plan: PricingPlan;
}

const PricingPlanCard = ({ plan }: PricingPlanCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const { updatePricingMutation, deletePricingMutation } = usePricingPlans(user?.id, true);
  
  // Check if this specific plan is being processed
  const isUpdating = updatePricingMutation.isPending && updatePricingMutation.variables?.id === plan.id;
  const isDeleting = deletePricingMutation.isPending && deletePricingMutation.variables === plan.id;

  return (
    <>
      <Card className={!plan.active ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{plan.title}</span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
                disabled={isUpdating || isDeleting}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${plan.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">per month</p>
          
          <div className="mt-4 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={plan.active ? "text-green-600" : "text-gray-500"}>
                {plan.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Last Updated:</span>
              <span className="text-muted-foreground">
                {new Date(plan.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PricingPlanEditDialog 
        plan={plan}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      
      <PricingPlanDeleteDialog
        planId={plan.id}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default PricingPlanCard;
