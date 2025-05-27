
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CreateDirectoryWebsiteData, Category } from '@/services/directoryService';
import { RankingSummary } from '@/lib/mockData';

interface DirectoryAddFormProps {
  categories: Category[];
  userWebsites: RankingSummary[];
  onSubmit: (formData: CreateDirectoryWebsiteData) => Promise<boolean>;
}

export function DirectoryAddForm({ categories, userWebsites, onSubmit }: DirectoryAddFormProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  const [formData, setFormData] = useState<CreateDirectoryWebsiteData>({
    domain: '',
    title: '',
    description: '',
    category_id: '',
    website_id: null,
    contact_name: '',
    contact_email: '',
    phone_number: '',
    reciprocal_link: ''
  });

  const handleWebsiteSelection = (websiteId: string) => {
    setSelectedWebsite(websiteId);
    const website = userWebsites.find(w => w.websiteId === websiteId);
    if (website) {
      setFormData(prev => ({
        ...prev,
        domain: website.domain,
        title: website.title || '',
        description: website.description || '',
        website_id: websiteId
      }));
    }
  };

  const handleManualToggle = () => {
    setIsManualEntry(!isManualEntry);
    setSelectedWebsite('');
    setFormData({
      domain: '',
      title: '',
      description: '',
      category_id: '',
      website_id: null,
      contact_name: '',
      contact_email: '',
      phone_number: '',
      reciprocal_link: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.domain || !formData.category_id) {
      toast.error('Domain and category are required');
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        domain: '',
        title: '',
        description: '',
        category_id: '',
        website_id: null,
        contact_name: '',
        contact_email: '',
        phone_number: '',
        reciprocal_link: ''
      });
      setSelectedWebsite('');
      setIsManualEntry(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Website to Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={!isManualEntry ? "default" : "outline"}
              onClick={() => !isManualEntry || handleManualToggle()}
            >
              From Existing Websites
            </Button>
            <Button
              type="button"
              variant={isManualEntry ? "default" : "outline"}
              onClick={() => isManualEntry || handleManualToggle()}
            >
              Manual Entry
            </Button>
          </div>

          {!isManualEntry ? (
            <div>
              <Label htmlFor="website-select">Select Website</Label>
              <Select value={selectedWebsite} onValueChange={handleWebsiteSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a website" />
                </SelectTrigger>
                <SelectContent>
                  {userWebsites.map((website) => (
                    <SelectItem key={website.websiteId} value={website.websiteId}>
                      {website.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({...prev, domain: e.target.value}))}
                placeholder="example.com"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              placeholder="Website title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Website description"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category_id || ''} onValueChange={(value) => setFormData(prev => ({...prev, category_id: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData(prev => ({...prev, contact_name: e.target.value}))}
                placeholder="Contact person"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData(prev => ({...prev, contact_email: e.target.value}))}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add to Directory
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
