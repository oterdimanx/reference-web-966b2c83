
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePricingPlans } from '@/hooks/use-pricing-plans';
import { useAuth } from '@/contexts/AuthContext';

interface PricingPlanDeleteDialogProps {
  planId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingPlanDeleteDialog = ({ 
  planId,
  isOpen,
  onOpenChange
}: PricingPlanDeleteDialogProps) => {
  const { user } = useAuth();
  const { deletePricingMutation } = usePricingPlans(user?.id, true);

  const handleDelete = () => {
    deletePricingMutation.mutate(planId, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the pricing plan. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePricingMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PricingPlanDeleteDialog;
