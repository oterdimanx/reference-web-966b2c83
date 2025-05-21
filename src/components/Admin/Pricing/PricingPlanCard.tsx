
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { PricingPlan } from '@/hooks/use-pricing-plans';
import PricingPlanEditDialog from './PricingPlanEditDialog';
import PricingPlanDeleteDialog from './PricingPlanDeleteDialog';

interface PricingPlanCardProps {
  plan: PricingPlan;
}

const PricingPlanCard = ({ plan }: PricingPlanCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
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
