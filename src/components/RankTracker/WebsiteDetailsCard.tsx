
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Upload } from 'lucide-react';
import { RankingSummary } from '@/lib/mockData';
import { getImageUrl, checkImageExists } from '@/utils/imageUtils';
import { useEffect, useState } from 'react';

interface WebsiteDetailsCardProps {
  website: RankingSummary;
  onClose: () => void;
}

export function WebsiteDetailsCard({ website, onClose }: WebsiteDetailsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageExists, setImageExists] = useState<boolean | null>(null);
  
  // Check image existence and generate URL
  useEffect(() => {
    const checkAndSetImage = async () => {
      console.log('WebsiteDetailsCard: Processing website:', {
        domain: website.domain,
        imagePath: website.imagePath,
        title: website.title
      });
      
      setImageLoading(true);
      setImageError(false);
      
      if (!website.imagePath) {
        console.log('No imagePath found for website:', website.domain);
        setImageUrl(null);
        setImageExists(false);
        setImageLoading(false);
        return;
      }
      
      try {
        // Check if file exists in storage
        const exists = await checkImageExists(website.imagePath);
        setImageExists(exists);
        
        if (exists) {
          const url = getImageUrl(website.imagePath);
          console.log(`Generated URL for ${website.imagePath}:`, url);
          setImageUrl(url);
        } else {
          console.warn(`Image file not found in storage: ${website.imagePath}`);
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Error checking image:', error);
        setImageError(true);
        setImageUrl(null);
      } finally {
        setImageLoading(false);
      }
    };
    
    checkAndSetImage();
  }, [website.imagePath]);
  
  // Show modal with animation
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <Card 
        className={`max-w-2xl w-full mx-4 transition-all duration-300 transform ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">{website.title || website.domain}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            {/* Text content on the left */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Website URL</h3>
                <p className="text-sm">{website.domain}</p>
              </div>
              
              {website.description && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{website.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">Avg Position</h4>
                  <p>#{website.avgPosition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">Keywords</h4>
                  <p>{website.keywordCount}</p>
                </div>
              </div>
            </div>
            
            {/* Image on the right */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg relative">
                {imageLoading ? (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                  </div>
                ) : imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={website.title || website.domain}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
                    {website.imagePath && imageExists === false ? (
                      <>
                        <AlertCircle className="h-6 w-6 text-red-500 mb-1" />
                        <span className="text-xs text-red-500 text-center">Image missing</span>
                      </>
                    ) : website.imagePath && imageError ? (
                      <>
                        <AlertCircle className="h-6 w-6 text-amber-500 mb-1" />
                        <span className="text-xs text-amber-500 text-center">Load error</span>
                      </>
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop"
                        alt="Website placeholder"
                        className="w-full h-full object-cover rounded-lg opacity-50"
                      />
                    )}
                  </div>
                )}
                
                {/* Debug info overlay for development */}
                {process.env.NODE_ENV === 'development' && website.imagePath && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                    <div>Path: {website.imagePath}</div>
                    <div>Exists: {imageExists ? '✓' : '✗'}</div>
                    {imageUrl && <div className="truncate">URL: {imageUrl}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
