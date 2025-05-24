
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCardForm } from './CreditCardForm';
import { CheckCircle } from 'lucide-react';

interface PaymentStepProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
  isPaymentComplete?: boolean;
}

export function PaymentStep({ amount, onPaymentSuccess, onPaymentCancel, isPaymentComplete }: PaymentStepProps) {
  if (isPaymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Paiement confirmé</h3>
              <p className="text-sm text-gray-600">
                Votre paiement de {amount.toFixed(2)} € a été traité avec succès.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Finaliser votre commande</h2>
        <p className="text-gray-600">
          Veuillez effectuer le paiement avant de continuer avec les détails du site web.
        </p>
      </div>
      
      <CreditCardForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentCancel={onPaymentCancel}
      />
    </div>
  );
}
