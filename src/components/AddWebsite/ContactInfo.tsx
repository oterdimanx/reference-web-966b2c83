
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactInfoProps {
  form: UseFormReturn<any>;
}

const phonePrefixes = [
  { value: '+33', label: 'France (+33)' },
  { value: '+1', label: 'USA/Canada (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+32', label: 'Belgium (+32)' },
];

export function ContactInfo({ form }: ContactInfoProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('addWebsiteForm', 'contactName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('addWebsiteForm', 'contactNamePlaceholder')} required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('addWebsiteForm', 'contactEmail')}</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder={t('addWebsiteForm', 'contactEmailPlaceholder')} 
                  required 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="phone_prefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('addWebsiteForm', 'countryCode')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('addWebsiteForm', 'selectCountryCode')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {phonePrefixes.map((prefix) => (
                    <SelectItem key={prefix.value} value={prefix.value}>
                      {prefix.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t('addWebsiteForm', 'phoneNumber')}</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder={t('addWebsiteForm', 'phoneNumberPlaceholder')} 
                  required 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {t('addWebsiteForm', 'phoneNumberDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
