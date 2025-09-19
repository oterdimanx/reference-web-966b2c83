import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageMetadata } from '@/hooks/usePageMetadata';
import { Globe, Twitter, Share2, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetadataPreviewProps {
  metadata: PageMetadata;
  onClose: () => void;
}

export const MetadataPreview = ({ metadata, onClose }: MetadataPreviewProps) => {
  const validateSEO = (meta: PageMetadata) => {
    const issues = [];
    const suggestions = [];

    // Title validation
    if (!meta.title) {
      issues.push('Missing title');
    } else if (meta.title.length < 30) {
      suggestions.push('Title is shorter than recommended (30+ characters)');
    } else if (meta.title.length > 60) {
      issues.push('Title is too long (60+ characters)');
    }

    // Description validation
    if (!meta.description) {
      issues.push('Missing description');
    } else if (meta.description.length < 120) {
      suggestions.push('Description is shorter than recommended (120+ characters)');
    } else if (meta.description.length > 160) {
      issues.push('Description is too long (160+ characters)');
    }

    // Keywords validation
    if (!meta.keywords) {
      suggestions.push('Consider adding keywords');
    }

    return { issues, suggestions };
  };

  const { issues, suggestions } = validateSEO(metadata);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            SEO Preview - {metadata.page_key}
            <Badge variant="secondary">{metadata.language.toUpperCase()}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* SEO Health Check */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">SEO Health Check</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.length === 0 && suggestions.length === 0 ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>All SEO checks passed!</span>
                </div>
              ) : (
                <>
                  {issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-700 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Issues ({issues.length})
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {issues.map((issue, index) => (
                          <li key={index} className="text-red-600 bg-red-50 p-2 rounded">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-700">
                        Suggestions ({suggestions.length})
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="text-yellow-600 bg-yellow-50 p-2 rounded">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Google Search Preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Google Search Preview
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="space-y-1">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {metadata.title || 'Untitled Page'}
                </div>
                <div className="text-green-700 text-sm">
                  {metadata.canonical_url || 'https://example.com/page'}
                </div>
                <div className="text-gray-600 text-sm leading-relaxed">
                  {metadata.description || 'No description available'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Open Graph Preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media Preview (Open Graph)
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-lg">
              {metadata.og_image && (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src={metadata.og_image} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-500">Image not available</div>';
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="font-semibold text-gray-900 line-clamp-2">
                  {metadata.og_title || metadata.title || 'Untitled Page'}
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {metadata.og_description || metadata.description || 'No description available'}
                </div>
                <div className="text-gray-500 text-xs uppercase">
                  {metadata.canonical_url ? new URL(metadata.canonical_url).hostname : 'example.com'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Twitter Card Preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Twitter Card Preview
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-lg">
              {metadata.twitter_image && (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src={metadata.twitter_image} 
                    alt="Twitter Preview" 
                    className="max-w-full max-h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-500">Image not available</div>';
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="font-semibold text-gray-900 line-clamp-2">
                  {metadata.twitter_title || metadata.title || 'Untitled Page'}
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {metadata.twitter_description || metadata.description || 'No description available'}
                </div>
                <div className="text-gray-500 text-xs">
                  {metadata.canonical_url ? new URL(metadata.canonical_url).hostname : 'example.com'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Raw Metadata */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Raw Metadata</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(metadata).map(([key, value]) => (
                value && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && (
                  <div key={key}>
                    <span className="text-blue-600">{key}:</span>{' '}
                    <span className="text-gray-700">{String(value)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};