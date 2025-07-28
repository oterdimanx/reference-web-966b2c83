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

const contactSchema = z.object({
  contactName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['mes droits', 'support'], {
    required_error: 'Veuillez sélectionner un type de demande',
  }),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);

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
      toast.error(`Veuillez attendre ${remainingTime} minute(s) avant d'envoyer un nouveau message.`);
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

      toast.success('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
      form.reset();
      setLastSubmissionTime(now);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Nous contacter
            </CardTitle>
            <CardDescription className="text-lg">
              Vous avez une question ou besoin d'assistance ? N'hésitez pas à nous contacter.
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
                      <FormLabel>Nom de contact</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre nom complet" 
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
                      <FormLabel>Type de demande</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Sélectionnez le type de votre demande" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mes droits">Mes droits</SelectItem>
                          <SelectItem value="support">Support technique</SelectItem>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre demande en détail..."
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
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}