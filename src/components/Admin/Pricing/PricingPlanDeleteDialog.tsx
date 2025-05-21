
import { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    
    deletePricingMutation.mutate(planId, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        setError(error.message);
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
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePricingMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deletePricingMutation.isPending}
          >
            {deletePricingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PricingPlanDeleteDialog;
