import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { PageMetadata } from '@/hooks/usePageMetadata';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MetadataPreview } from './MetadataPreview';
import { useState } from 'react';

interface MetadataTableProps {
  metadata: PageMetadata[];
  onEdit: (metadata: PageMetadata) => void;
  onRefresh: () => void;
}

export const MetadataTable = ({ metadata, onEdit, onRefresh }: MetadataTableProps) => {
  const [previewMetadata, setPreviewMetadata] = useState<PageMetadata | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metadata entry?')) return;

    const { error } = await supabase
      .from('page_metadata')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete metadata',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Metadata deleted successfully',
      });
      onRefresh();
    }
  };

  const getLanguageBadgeVariant = (language: string) => {
    return language === 'en' ? 'default' : 'secondary';
  };

  const truncateText = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const validateSEO = (meta: PageMetadata) => {
    const issues = [];
    if (!meta.title || meta.title.length < 30 || meta.title.length > 60) {
      issues.push('Title length should be 30-60 characters');
    }
    if (!meta.description || meta.description.length < 120 || meta.description.length > 160) {
      issues.push('Description length should be 120-160 characters');
    }
    if (!meta.keywords) {
      issues.push('Missing keywords');
    }
    return issues;
  };

  return (
    <div className="space-y-4">
      {previewMetadata && (
        <MetadataPreview
          metadata={previewMetadata}
          onClose={() => setPreviewMetadata(null)}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Key</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>SEO Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metadata.map((meta) => {
              const seoIssues = validateSEO(meta);
              return (
                <TableRow key={meta.id}>
                  <TableCell className="font-medium">{meta.page_key}</TableCell>
                  <TableCell>
                    <Badge variant={getLanguageBadgeVariant(meta.language)}>
                      {meta.language.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell title={meta.title}>
                    {truncateText(meta.title)}
                  </TableCell>
                  <TableCell title={meta.description}>
                    {truncateText(meta.description)}
                  </TableCell>
                  <TableCell>
                    {seoIssues.length === 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Good
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {seoIssues.length} issue{seoIssues.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewMetadata(meta)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(meta)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meta.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {metadata.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No metadata entries found. Create your first entry to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};