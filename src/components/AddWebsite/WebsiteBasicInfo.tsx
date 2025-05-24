
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { UseFormReturn } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';

interface WebsiteBasicInfoProps {
  form: UseFormReturn<any>;
  onImageSelect: (file: File | null) => void;
}

export function WebsiteBasicInfo({ form, onImageSelect }: WebsiteBasicInfoProps) {
  const { t } = useLanguage();

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'websiteTitle')}</FormLabel>
            <FormControl>
              <Input placeholder={t('addWebsiteForm', 'websiteTitlePlaceholder')} required {...field} />
            </FormControl>
            <FormDescription>
              {t('addWebsiteForm', 'websiteTitleDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="domain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'websiteUrl')}</FormLabel>
            <FormControl>
              <Input placeholder={t('addWebsiteForm', 'websiteUrlPlaceholder')} required {...field} />
            </FormControl>
            <FormDescription>
              {t('addWebsiteForm', 'websiteUrlDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageUpload
        onImageSelect={onImageSelect}
        maxSize={{ width: 200, height: 200 }}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('addWebsiteForm', 'description')}</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t('addWebsiteForm', 'descriptionPlaceholder')} 
                className="resize-none min-h-[100px]"
                required
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
