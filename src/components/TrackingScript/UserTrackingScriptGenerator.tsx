import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateTrackingScript } from '@/services/eventTrackingService';
import { Copy, Check, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

export function UserTrackingScriptGenerator() {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fetch user's websites
  const { data: websites, isLoading } = useQuery({
    queryKey: ['user-websites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('websites')
        .select('id, domain, title')
        .eq('user_id', user.id)
        .order('domain');

      if (error) {
        console.error('Error fetching websites:', error);
        return [];
      }

      return data;
    },
    enabled: !!user
  });

  const handleCopyScript = () => {
    if (!selectedWebsiteId) return;

    const script = generateTrackingScript(selectedWebsiteId);
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast({
      title: t('trackingScriptPage', 'scriptCopied'),
      description: t('trackingScriptPage', 'scriptCopiedDescription'),
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const trackingScript = selectedWebsiteId ? generateTrackingScript(selectedWebsiteId) : '';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            {t('trackingScriptPage', 'loadingWebsites')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!websites || websites.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          {t('trackingScriptPage', 'noWebsitesFound')}{' '}
          <Link to="/add-website" className="underline">
            {t('trackingScriptPage', 'addWebsite')}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('trackingScriptPage', 'generateScript')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('trackingScriptPage', 'selectWebsite')}
            </label>
            <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
              <SelectTrigger>
                <SelectValue placeholder={t('trackingScriptPage', 'chooseWebsite')} />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {websites.map((website) => (
                  <SelectItem key={website.id} value={website.id}>
                    {website.domain} {website.title && `(${website.title})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWebsiteId && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  {t('trackingScriptPage', 'trackingScript')}
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyScript}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t('trackingScriptPage', 'copied') : t('trackingScriptPage', 'copy')}
                </Button>
              </div>
              <Textarea
                value={trackingScript}
                readOnly
                rows={12}
                className="font-mono text-sm"
                placeholder={t('trackingScriptPage', 'selectWebsitePlaceholder')}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('trackingScriptPage', 'scriptInstructions')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWebsiteId && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('trackingScriptPage', 'afterSetup')}</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/worldview">{t('worldViewPage', 'title')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}