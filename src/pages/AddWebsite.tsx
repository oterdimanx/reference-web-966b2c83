
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveWebsiteDetailed } from '@/services/websiteService';
import { RankingSummary } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

// Common phone prefixes with French (+33) as default
const phonePrefixes = [
  { value: '+33', label: 'France (+33)' },
  { value: '+1', label: 'USA/Canada (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+32', label: 'Belgium (+32)' },
];

// Define pricing plan type
interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

const AddWebsite = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get URL parameters if coming from homepage form
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  const keywordsParam = urlParams.get('keywords') || '';
  
  // Form validation schema with translated messages
  const formSchema = z.object({
    title: z.string().min(1, t('addWebsiteForm', 'titleRequired')),
    domain: z.string().min(1, t('addWebsiteForm', 'domainRequired')),
    description: z.string().min(1, t('addWebsiteForm', 'descriptionRequired')),
    contact_name: z.string().min(1, t('addWebsiteForm', 'contactNameRequired')),
    contact_email: z.string().email(t('addWebsiteForm', 'invalidEmail')),
    phone_prefix: z.string().default('+33'),
    phone_number: z.string()
      .min(1, t('addWebsiteForm', 'phoneRequired'))
      .regex(/^\d+$/, t('addWebsiteForm', 'phoneDigitsOnly')),
    reciprocal_link: z.string().optional(),
    keywords: z.string().min(1, t('addWebsiteForm', 'keywordsRequired')),
    pricing_id: z.string().min(1, t('addWebsiteForm', 'planRequired'))
  });

  type FormValues = z.infer<typeof formSchema>;
  
  // Fetch pricing plans
  const { data: pricingPlans, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('id, title, price')
        .eq('active', true)
        .order('price', { ascending: true });
        
      if (error) throw error;
      return data as PricingPlan[];
    }
  });
  
  // Check for duplicate domain
  const checkDuplicateDomain = async (domain: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact' })
        .eq('domain', domain)
        .eq('user_id', user.id);
      
      return count !== undefined && count > 0;
    } catch (error) {
      console.error('Error checking duplicate domain:', error);
      return false;
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      domain: domainParam,
      description: '',
      contact_name: '',
      contact_email: user?.email || '',
      phone_prefix: '+33',
      phone_number: '',
      reciprocal_link: '',
      keywords: keywordsParam,
      pricing_id: ''
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Double check for duplicate domain
      const isDuplicate = await checkDuplicateDomain(data.domain);
      
      if (isDuplicate) {
        toast.error(`Website "${data.domain}" already exists in your account.`);
        setIsSubmitting(false);
        return;
      }
      
      // Create a website entry with the form data
      const keywordsArray = data.keywords.split(',').filter(k => k.trim().length > 0);
      
      const websiteData: RankingSummary = {
        websiteId: uuidv4(),
        domain: data.domain,
        avgPosition: Math.floor(Math.random() * 15) + 1, // Random position between 1-15
        change: Math.floor(Math.random() * 5), // Random change between 0-4
        keywordCount: keywordsArray.length,
        topKeyword: keywordsArray[0]?.trim() || 'N/A',
        topKeywordPosition: Math.floor(Math.random() * 10) + 1,
      };
      
      // Find selected pricing plan
      const selectedPlan = pricingPlans?.find(plan => plan.id === data.pricing_id);
      
      // Add the additional fields
      const detailedWebsiteData = {
        ...websiteData,
        title: data.title,
        description: data.description,
        contactName: data.contact_name,
        contactEmail: data.contact_email,
        phonePrefix: data.phone_prefix,
        phoneNumber: data.phone_number,
        reciprocalLink: data.reciprocal_link || null,
        pricingId: data.pricing_id,
        pricingTitle: selectedPlan?.title || 'Unknown',
        pricingPrice: selectedPlan?.price || 0
      };
      
      const savedWebsite = await saveWebsiteDetailed(detailedWebsiteData);
      
      if (savedWebsite) {
        toast.success("Website added successfully!");
        navigate('/');
      } else {
        toast.error("Failed to add website. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("An error occurred while adding the website.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">{t('addWebsiteForm', 'pageTitle')}</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('addWebsiteForm', 'websiteDetails')}</CardTitle>
              <CardDescription>
                {t('addWebsiteForm', 'websiteDetailsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-rank-teal hover:bg-rank-teal/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('addWebsiteForm', 'addingWebsite') : t('addWebsiteForm', 'addWebsiteButton')}
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
};

export default AddWebsite;
