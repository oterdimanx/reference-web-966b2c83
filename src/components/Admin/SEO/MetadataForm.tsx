import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageMetadata } from '@/hooks/usePageMetadata';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save, X, AlertCircle } from 'lucide-react';

interface MetadataFormProps {
  metadata: PageMetadata | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PAGE_KEYS = [
  'index', 'about', 'contact', 'directories', 'pricing', 
  'privacy', 'terms', 'auth', 'sitemap', 'notfound'
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' }
];

export const MetadataForm = ({ metadata, onSuccess, onCancel }: MetadataFormProps) => {
  const [formData, setFormData] = useState({
    page_key: metadata?.page_key || '',
    language: metadata?.language || 'en',
    title: metadata?.title || '',
    description: metadata?.description || '',
    keywords: metadata?.keywords || '',
    og_title: metadata?.og_title || '',
    og_description: metadata?.og_description || '',
    og_image: metadata?.og_image || '',
    twitter_title: metadata?.twitter_title || '',
    twitter_description: metadata?.twitter_description || '',
    twitter_image: metadata?.twitter_image || '',
    canonical_url: metadata?.canonical_url || '',
    robots: metadata?.robots || 'index,follow',
    author: metadata?.author || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        // Remove empty strings and replace with null
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            value === '' ? null : value
          ])
        )
      };

      if (metadata?.id) {
        // Update existing
        const { error } = await supabase
          .from('page_metadata')
          .update(dataToSubmit)
          .eq('id', metadata.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Metadata updated successfully',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('page_metadata')
          .insert(dataToSubmit);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Metadata created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save metadata',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    const isOver = text.length > max;
    const isUnder = text.length < (max * 0.8);
    return (
      <span className={`text-sm ${isOver ? 'text-red-500' : isUnder ? 'text-yellow-500' : 'text-green-500'}`}>
        {text.length}/{max}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {metadata ? 'Edit Metadata' : 'Create New Metadata'}
        </CardTitle>
        <CardDescription>
          Configure SEO metadata for better search engine visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_key">Page Key</Label>
              <Select 
                value={formData.page_key} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, page_key: value }))}
                disabled={!!metadata}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_KEYS.map(key => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                disabled={!!metadata}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="opengraph">Open Graph</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title {getCharacterCount(formData.title, 60)}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Page title (30-60 characters recommended)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description {getCharacterCount(formData.description, 160)}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Meta description (120-160 characters recommended)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </TabsContent>

            <TabsContent value="opengraph" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og_title">Open Graph Title</Label>
                <Input
                  id="og_title"
                  value={formData.og_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                  placeholder="Leave empty to use main title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_description">Open Graph Description</Label>
                <Textarea
                  id="og_description"
                  value={formData.og_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
                  placeholder="Leave empty to use main description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_image">Open Graph Image URL</Label>
                <Input
                  id="og_image"
                  value={formData.og_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg (1200x630 recommended)"
                />
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter_title">Twitter Title</Label>
                <Input
                  id="twitter_title"
                  value={formData.twitter_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_title: e.target.value }))}
                  placeholder="Leave empty to use main title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_description">Twitter Description</Label>
                <Textarea
                  id="twitter_description"
                  value={formData.twitter_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_description: e.target.value }))}
                  placeholder="Leave empty to use main description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_image">Twitter Image URL</Label>
                <Input
                  id="twitter_image"
                  value={formData.twitter_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                  placeholder="https://example.com/page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Robots Directive</Label>
                <Select 
                  value={formData.robots} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, robots: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index,follow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex,nofollow</SelectItem>
                    <SelectItem value="index,nofollow">index,nofollow</SelectItem>
                    <SelectItem value="noindex,follow">noindex,follow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Metadata'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};