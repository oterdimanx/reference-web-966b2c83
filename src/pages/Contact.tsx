import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { DynamicHead } from '@/components/SEO/DynamicHead';

const getContactSchema = (t: (section: string, key: string) => string) => z.object({
  contactName: z.string().min(2, t('contactPage', 'nameValidation')),
  type: z.enum(['mes droits', 'support'], {
    required_error: t('contactPage', 'typeValidation'),
  }),
  description: z.string().min(10, t('contactPage', 'descriptionValidation')),
});

export default function Contact() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);

  const contactSchema = getContactSchema(t);
  type ContactFormValues = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactName: user?.email?.split('@')[0] || '',
      type: undefined,
      description: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    // Spam prevention: Check if user submitted a message in the last 5 minutes
    const now = Date.now();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
    
    if (lastSubmissionTime && (now - lastSubmissionTime) < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (now - lastSubmissionTime)) / 60000);
      toast.error(t('contactPage', 'rateLimitMessage').replace('{minutes}', remainingTime.toString()));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact')
        .insert({
          user_id: user?.id || null,
          contact_name: values.contactName,
          type: values.type,
          description: values.description,
        });

      if (error) throw error;

      toast.success(t('contactPage', 'successMessage'));
      form.reset();
      setLastSubmissionTime(now);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(t('contactPage', 'errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead 
        pageKey="contact"
        fallbackTitle="Contact - RankTracker"
        fallbackDescription="Contactez notre équipe pour toute question ou assistance concernant votre suivi de référencement"
        fallbackKeywords="contact, support, assistance, ranktracker"
      />
      <Header />
      <main className="flex-grow bg-gradient-to-br from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('contactPage', 'title')}
              </CardTitle>
              <CardDescription className="text-lg">
                {t('contactPage', 'description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactPage', 'contactNameLabel')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('contactPage', 'contactNamePlaceholder')} 
                            {...field} 
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactPage', 'requestTypeLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder={t('contactPage', 'requestTypePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mes droits">{t('contactPage', 'rightsOption')}</SelectItem>
                            <SelectItem value="support">{t('contactPage', 'supportOption')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contactPage', 'descriptionLabel')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('contactPage', 'descriptionPlaceholder')}
                            className="min-h-[120px] bg-background/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  >
                    {isSubmitting ? t('contactPage', 'submittingButton') : t('contactPage', 'submitButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}