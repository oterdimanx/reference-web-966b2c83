
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

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  domain: z.string().min(1, "Domain is required"),
  description: z.string().min(1, "Description is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Invalid email address"),
  phone_prefix: z.string().default('+33'),
  phone_number: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  reciprocal_link: z.string().optional(),
  keywords: z.string().min(1, "At least one keyword is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AddWebsite = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get URL parameters if coming from homepage form
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  const keywordsParam = urlParams.get('keywords') || '';
  
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
      keywords: keywordsParam
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
      
      // Add the additional fields
      const detailedWebsiteData = {
        ...websiteData,
        title: data.title,
        description: data.description,
        contactName: data.contact_name,
        contactEmail: data.contact_email,
        phonePrefix: data.phone_prefix,
        phoneNumber: data.phone_number,
        reciprocalLink: data.reciprocal_link || null
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
          <h1 className="text-3xl font-bold mb-6">Add Website</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Website Details</CardTitle>
              <CardDescription>
                Enter information about the website you want to track
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
                        <FormLabel>Website Title</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Website" required {...field} />
                        </FormControl>
                        <FormDescription>
                          The name or title of your website
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
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="example.com" required {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the domain without http:// or https://
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your website" 
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
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" required {...field} />
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
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="email@example.com" 
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
                          <FormLabel>Country Code</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country code" />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="612345678" 
                              required 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter only numbers without spaces or special characters
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
                        <FormLabel>Reciprocal Link (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/partners/referencerank" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Link back to our service from your website (optional)
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
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seo, marketing, web design" 
                            required 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter keywords separated by commas
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
                    {isSubmitting ? "Adding Website..." : "Add Website"}
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
