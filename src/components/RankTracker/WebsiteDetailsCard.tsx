
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { RankingSummary } from '@/lib/mockData';
import { getImageUrl } from '@/utils/imageUtils';
import { useEffect, useState } from 'react';

interface WebsiteDetailsCardProps {
  website: RankingSummary;
  onClose: () => void;
}

export function WebsiteDetailsCard({ website, onClose }: WebsiteDetailsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const imageUrl = getImageUrl(website.imagePath);
  
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
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={website.title || website.domain}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop"
                    alt="Website placeholder"
                    className="w-full h-full object-cover rounded-lg opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
