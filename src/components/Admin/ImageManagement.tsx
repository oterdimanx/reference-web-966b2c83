import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cleanupBrokenImagePaths } from '@/utils/imageMigration';

interface ImageAuditResult {
  websiteId: string;
  domain: string;
  imagePath: string | null;
  imageExists: boolean;
  imageUrl: string | null;
}

export function ImageManagement() {
  const [auditResults, setAuditResults] = useState<ImageAuditResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    totalFiles: number;
    orphanedFiles: number;
  }>({ totalFiles: 0, orphanedFiles: 0 });

  const runImageAudit = async () => {
    setIsLoading(true);
    try {
      // Get all websites
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('id, domain, image_path');

      if (websitesError) throw websitesError;

      // Get all files in storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('website-images')
        .list('', { limit: 1000 });

      if (storageError) throw storageError;

      const storageFileNames = new Set(storageFiles?.map(f => f.name) || []);
      const usedFiles = new Set<string>();

      // Check each website's image
      const results: ImageAuditResult[] = [];
      
      for (const website of websites || []) {
        let imageExists = false;
        let imageUrl = null;

        if (website.image_path) {
          // Handle legacy paths
          if (website.image_path.startsWith('/images/websites/')) {
            const filename = website.image_path.split('/').pop();
            imageExists = filename ? storageFileNames.has(filename) : false;
            if (imageExists && filename) {
              usedFiles.add(filename);
              const { data } = supabase.storage
                .from('website-images')
                .getPublicUrl(filename);
              imageUrl = data.publicUrl;
            }
          } else {
            // New storage paths
            imageExists = storageFileNames.has(website.image_path);
            if (imageExists) {
              usedFiles.add(website.image_path);
              const { data } = supabase.storage
                .from('website-images')
                .getPublicUrl(website.image_path);
              imageUrl = data.publicUrl;
            }
          }
        }

        results.push({
          websiteId: website.id,
          domain: website.domain,
          imagePath: website.image_path,
          imageExists,
          imageUrl
        });
      }

      setAuditResults(results);
      setStorageStats({
        totalFiles: storageFiles?.length || 0,
        orphanedFiles: (storageFiles?.length || 0) - usedFiles.size
      });

    } catch (error) {
      console.error('Error running image audit:', error);
      toast.error('Failed to run image audit');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupBrokenPaths = async () => {
    try {
      await cleanupBrokenImagePaths();
      await runImageAudit(); // Refresh results
    } catch (error) {
      console.error('Error cleaning up broken paths:', error);
      toast.error('Failed to cleanup broken paths');
    }
  };

  const deleteOrphanedFiles = async () => {
    if (!confirm('Are you sure you want to delete orphaned files? This cannot be undone.')) {
      return;
    }

    try {
      // Get all files in storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('website-images')
        .list('', { limit: 1000 });

      if (storageError) throw storageError;

      // Get used files from database
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('image_path')
        .not('image_path', 'is', null);

      if (websitesError) throw websitesError;

      const usedFiles = new Set(
        websites?.map(w => {
          // Handle legacy paths
          if (w.image_path?.startsWith('/images/websites/')) {
            return w.image_path.split('/').pop();
          }
          return w.image_path;
        }).filter(Boolean) || []
      );

      const orphanedFiles = storageFiles?.filter(f => !usedFiles.has(f.name)) || [];

      if (orphanedFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('website-images')
          .remove(orphanedFiles.map(f => f.name));

        if (deleteError) throw deleteError;

        toast.success(`Deleted ${orphanedFiles.length} orphaned files`);
        await runImageAudit(); // Refresh results
      } else {
        toast.info('No orphaned files found');
      }

    } catch (error) {
      console.error('Error deleting orphaned files:', error);
      toast.error('Failed to delete orphaned files');
    }
  };

  useEffect(() => {
    runImageAudit();
  }, []);

  const stats = {
    total: auditResults.length,
    withImages: auditResults.filter(r => r.imagePath).length,
    validImages: auditResults.filter(r => r.imagePath && r.imageExists).length,
    brokenImages: auditResults.filter(r => r.imagePath && !r.imageExists).length,
    noImages: auditResults.filter(r => !r.imagePath).length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Image Storage Management
            <Button onClick={runImageAudit} disabled={isLoading} size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Audit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Websites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.validImages}</div>
              <div className="text-sm text-gray-500">Valid Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.brokenImages}</div>
              <div className="text-sm text-gray-500">Broken Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.noImages}</div>
              <div className="text-sm text-gray-500">No Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{storageStats.orphanedFiles}</div>
              <div className="text-sm text-gray-500">Orphaned Files</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={cleanupBrokenPaths} variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Cleanup Broken Paths
            </Button>
            <Button 
              onClick={deleteOrphanedFiles} 
              variant="outline" 
              size="sm"
              disabled={storageStats.orphanedFiles === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Orphaned Files ({storageStats.orphanedFiles})
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditResults.map((result) => (
              <div key={result.websiteId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{result.domain}</div>
                  {result.imagePath && (
                    <div className="text-sm text-gray-500">{result.imagePath}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!result.imagePath ? (
                    <Badge variant="secondary">No Image</Badge>
                  ) : result.imageExists ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Missing
                    </Badge>
                  )}
                  {result.imageUrl && (
                    <img 
                      src={result.imageUrl} 
                      alt={result.domain}
                      className="w-8 h-8 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}