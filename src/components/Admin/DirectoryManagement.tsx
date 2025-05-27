
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  getDirectoryWebsites, 
  getCategories, 
  createDirectoryWebsite, 
  updateDirectoryWebsite, 
  deleteDirectoryWebsite,
  DirectoryWebsite,
  Category,
  CreateDirectoryWebsiteData
} from '@/services/directoryService';
import { getUserWebsites } from '@/services/websiteService';

interface Website {
  id: string;
  domain: string;
  title?: string;
  description?: string;
}

export function DirectoryManagement() {
  const [directoryWebsites, setDirectoryWebsites] = useState<DirectoryWebsite[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userWebsites, setUserWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Form state
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [directoryData, categoriesData, websitesData] = await Promise.all([
        getDirectoryWebsites(),
        getCategories(),
        getUserWebsites()
      ]);
      
      setDirectoryWebsites(directoryData);
      setCategories(categoriesData);
      setUserWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteSelection = (websiteId: string) => {
    setSelectedWebsite(websiteId);
    const website = userWebsites.find(w => w.id === websiteId);
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

    try {
      const result = await createDirectoryWebsite(formData);
      if (result) {
        toast.success('Website added to directory');
        fetchData();
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
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error('Failed to add website to directory');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteDirectoryWebsite(id);
      if (success) {
        toast.success('Website removed from directory');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to remove website from directory');
    }
  };

  const toggleActiveStatus = async (website: DirectoryWebsite) => {
    try {
      const result = await updateDirectoryWebsite(website.id, {
        is_active: !website.is_active
      });
      if (result) {
        toast.success(`Website ${website.is_active ? 'deactivated' : 'activated'}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating website:', error);
      toast.error('Failed to update website status');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
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
                      <SelectItem key={website.id} value={website.id}>
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

      <Card>
        <CardHeader>
          <CardTitle>Directory Websites ({directoryWebsites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directoryWebsites.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className="font-medium">{website.domain}</TableCell>
                  <TableCell>{website.title || '-'}</TableCell>
                  <TableCell>{website.category?.name || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      website.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {website.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActiveStatus(website)}
                      >
                        {website.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Website</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{website.domain}" from the directory? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(website.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
