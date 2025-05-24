
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  maxSize?: { width: number; height: number };
  currentImage?: string | null;
}

export function ImageUpload({ 
  onImageSelect, 
  maxSize = { width: 200, height: 200 },
  currentImage 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const isValid = img.width <= maxSize.width && img.height <= maxSize.height;
        if (!isValid) {
          toast.error(`Image must be ${maxSize.width}x${maxSize.height}px or smaller. Current: ${img.width}x${img.height}px`);
        }
        resolve(isValid);
      };
      img.onerror = () => {
        toast.error('Invalid image file');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsValidating(true);

    // Validate dimensions
    const isValid = await validateImageDimensions(file);
    
    if (isValid) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageSelect(file);
      toast.success('Image selected successfully');
    } else {
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageSelect(null);
    }

    setIsValidating(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Website Image (Optional)</Label>
      <div className="flex items-center space-x-4">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isValidating}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            {isValidating ? 'Validating...' : 'Choose Image'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Maximum size: {maxSize.width}x{maxSize.height}px
          </p>
        </div>
      </div>
    </div>
  );
}
