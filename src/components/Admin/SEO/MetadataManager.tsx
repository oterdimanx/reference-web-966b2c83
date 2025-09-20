import { useState } from 'react';
import { useAllPageMetadata } from '@/hooks/usePageMetadata';
import { MetadataTable } from './MetadataTable';
import { MetadataForm } from './MetadataForm';
import { Button } from '@/components/ui/button';
import { Plus, Search, Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PageMetadata } from '@/hooks/usePageMetadata';
import { useLanguage } from '@/contexts/LanguageContext';

export const MetadataManager = () => {
  const { data: allMetadata = [], refetch } = useAllPageMetadata();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState<PageMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const filteredMetadata = allMetadata.filter(metadata => {
    const matchesSearch = metadata.page_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === 'all' || metadata.language === languageFilter;
    
    return matchesSearch && matchesLanguage;
  });

  const handleEdit = (metadata: PageMetadata) => {
    setEditingMetadata(metadata);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingMetadata(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMetadata(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            SEO Metadata Management
          </CardTitle>
          <CardDescription>
            Manage page metadata for search engine optimization across all languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <ToggleGroup 
                  type="single" 
                  value={languageFilter} 
                  onValueChange={(value) => value && setLanguageFilter(value)}
                  className="border rounded-md"
                >
                  <ToggleGroupItem value="all" className="px-3 py-1">All</ToggleGroupItem>
                  <ToggleGroupItem value="en" className="px-3 py-1">EN</ToggleGroupItem>
                  <ToggleGroupItem value="fr" className="px-3 py-1">FR</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Metadata
            </Button>
          </div>

          {showForm ? (
            <MetadataForm
              metadata={editingMetadata}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <MetadataTable
              metadata={filteredMetadata}
              onEdit={handleEdit}
              onRefresh={refetch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};