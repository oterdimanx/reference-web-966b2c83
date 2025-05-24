
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

interface AdditionalSettingsProps {
  form: UseFormReturn<any>;
  pricingPlans?: PricingPlan[];
  pricingLoading: boolean;
}

export function AdditionalSettings({ form, pricingPlans, pricingLoading }: AdditionalSettingsProps) {
  const { t } = useLanguage();

  return (
    <>
      <FormField
        control={form.control}
        name="reciprocal_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'reciprocalLink')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('addWebsiteForm', 'reciprocalLinkPlaceholder')} 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              {t('addWebsiteForm', 'reciprocalLinkDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'keywords')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('addWebsiteForm', 'keywordsPlaceholder')} 
                required 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              {t('addWebsiteForm', 'keywordsDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="pricing_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'selectPlan')}</FormLabel>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('addWebsiteForm', 'choosePricingPlan')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {pricingLoading ? (
                  <SelectItem value="loading" disabled>{t('addWebsiteForm', 'loadingPlans')}</SelectItem>
                ) : pricingPlans && pricingPlans.length > 0 ? (
                  pricingPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title} - ${plan.price.toFixed(2)}/month
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>{t('addWebsiteForm', 'noPlansAvailable')}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {t('addWebsiteForm', 'selectPlanDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
