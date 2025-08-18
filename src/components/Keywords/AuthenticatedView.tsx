
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeywordTable } from './KeywordTable';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Website {
  id: string;
  domain: string;
  title: string;
}

export const AuthenticatedView = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('all');
  
  useEffect(() => {
    if (user) {
      loadWebsites();
    }
  }, [user]);

  const loadWebsites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('id, domain, title')
        .eq('user_id', user.id)
        .not('keywords', 'is', null)
        .not('keywords', 'eq', '');

      if (error) throw error;
      setWebsites(data || []);
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{t('pages', 'yourKeywords')}</CardTitle>
          <CardDescription>
            {t('pages', 'keywordsTitle')}
          </CardDescription>
          {websites.length > 1 && (
            <div className="pt-4">
              <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select a website" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Websites</SelectItem>
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.title || website.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <KeywordTable 
            selectedWebsiteId={selectedWebsiteId === 'all' ? undefined : selectedWebsiteId} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
