import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSimpleWebsiteSubmission } from "@/hooks/useSimpleWebsiteSubmission";
import { useAddWebsiteForm } from "@/hooks/useAddWebsiteForm";
import { WebsiteBasicInfo } from "./WebsiteBasicInfo";
import { ContactInfo } from "./ContactInfo";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

interface SimpleWebsiteFormProps {
  userSubscription: any;
}

export const SimpleWebsiteForm = ({ userSubscription }: SimpleWebsiteFormProps) => {
  const { t } = useLanguage();
  
  // Create a simple translation function for now
  const tLocal = (key: string) => {
    const translations: { [key: string]: string } = {
      'forms.addWebsite': 'Add Website',
      'forms.websitesRemaining': 'Websites remaining',
      'forms.keywords': 'Keywords',
      'forms.keywordsPlaceholder': 'Enter keywords separated by commas',
      'forms.reciprocalLink': 'Reciprocal Link',
      'forms.reciprocalLinkPlaceholder': 'Optional: Link to exchange with our site',
      'forms.submitting': 'Submitting...',
      'forms.websiteAdded': 'Website added successfully!',
      'forms.submissionError': 'Error submitting website. Please try again.'
    };
    return translations[key] || key;
  };
  const { user } = useAuth();
  const { submitWebsite, isSubmitting } = useSimpleWebsiteSubmission();
  const { form, selectedImage, setSelectedImage, onSubmit } = useAddWebsiteForm(undefined, true);

  const handleSubmitValid = async (data: any) => {
    console.log('Form validation passed, submitting data:', data);
    try {
      await submitWebsite(data, selectedImage);
      // Success toast is handled in useSimpleWebsiteSubmission
    } catch (error) {
      console.error('Error submitting website:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add website: ${errorMessage}`);
    }
  };

  const handleSubmitInvalid = (errors: any) => {
    console.log('Form validation failed:', errors);
    const firstError = Object.values(errors)[0] as any;
    const errorMessage = firstError?.message || 'Please fill in all required fields correctly';
    toast.error(`Validation Error: ${errorMessage}`);
  };

  const websitesRemaining = userSubscription?.websitesAllowed - userSubscription?.websitesUsed;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t('common', 'addWebsite')}</CardTitle>
            <CardDescription>
              {t('common', 'websitesRemaining')}: {websitesRemaining} / {userSubscription?.websitesAllowed}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitValid, handleSubmitInvalid)} className="space-y-6">
                <WebsiteBasicInfo 
                  form={form} 
                  onImageSelect={setSelectedImage}
                />
                
                <ContactInfo form={form} />
                
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tLocal('forms.keywords')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={tLocal('forms.keywordsPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reciprocal_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tLocal('forms.reciprocalLink')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={tLocal('forms.reciprocalLinkPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tLocal('forms.submitting')}
                    </>
                  ) : (
                    tLocal('forms.addWebsite')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};