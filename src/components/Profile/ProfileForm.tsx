
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileFormSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
}

interface ProfileFormProps {
  profile: Profile | null;
  userEmail: string | undefined;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProfileForm = ({ profile, userEmail, onSubmit, onCancel, isLoading }: ProfileFormProps) => {
  const { t } = useLanguage();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      email: userEmail || '',
      website: profile?.website || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profilePage', 'fullName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('profilePage', 'fullNamePlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profilePage', 'username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('profilePage', 'usernamePlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                {t('profilePage', 'usernameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profilePage', 'email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('profilePage', 'emailPlaceholder')} {...field} disabled />
              </FormControl>
              <FormDescription>
                {t('profilePage', 'emailDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profilePage', 'website')}</FormLabel>
              <FormControl>
                <Input placeholder={t('profilePage', 'websitePlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            {t('profilePage', 'cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('profilePage', 'saving') : t('profilePage', 'saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
