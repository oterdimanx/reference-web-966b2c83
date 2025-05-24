
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreditCardFormProps {
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
  amount: number;
}

export function CreditCardForm({ onPaymentSuccess, onPaymentCancel, amount }: CreditCardFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    country: 'FR'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'cardNumber') {
      processedValue = formatCardNumber(value.replace(/\s/g, '').slice(0, 16));
    } else if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'cardholderName') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'Numéro de carte invalide (16 chiffres requis)';
    }
    
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Date d\'expiration requise';
    } else {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expYear = parseInt(formData.expiryYear);
      const expMonth = parseInt(formData.expiryMonth);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiry = 'Date d\'expiration invalide';
      }
    }
    
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV invalide (3 chiffres requis)';
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nom du titulaire requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Mock payment processing - simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment (you can add random failure for testing)
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        onPaymentSuccess();
      } else {
        setErrors({ general: 'Paiement refusé. Veuillez vérifier vos informations.' });
      }
    } catch (error) {
      setErrors({ general: 'Erreur de traitement. Veuillez réessayer.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 15; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement sécurisé
        </CardTitle>
        <CardDescription>
          Montant à payer: <span className="font-semibold">{amount.toFixed(2)} €</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Numéro de carte</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && <p className="text-sm text-red-600">{errors.cardNumber}</p>}
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Mois</Label>
              <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                <SelectTrigger className={errors.expiry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Année</Label>
              <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                <SelectTrigger className={errors.expiry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="AAAA" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                className={errors.cvv ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {errors.expiry && <p className="text-sm text-red-600">{errors.expiry}</p>}
          {errors.cvv && <p className="text-sm text-red-600">{errors.cvv}</p>}
          
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nom du titulaire</Label>
            <Input
              id="cardholderName"
              placeholder="JEAN DUPONT"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              className={errors.cardholderName ? 'border-red-500' : ''}
            />
            {errors.cardholderName && <p className="text-sm text-red-600">{errors.cardholderName}</p>}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>Paiement sécurisé SSL</span>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPaymentCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-rank-teal hover:bg-rank-teal/90"
            >
              {isProcessing ? 'Traitement...' : `Payer ${amount.toFixed(2)} €`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
