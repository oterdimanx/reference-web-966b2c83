
// Utility functions for image handling

export const saveImageToPublic = async (file: File, filename: string): Promise<string> => {
  try {
    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${filename}-${timestamp}.${extension}`;
    
    // In a real application, you would upload to your server or cloud storage
    // For now, we'll create a data URL and store the path reference
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Store the file data in localStorage with the filename as key
        // This simulates storing in public folder for demo purposes
        const dataUrl = reader.result as string;
        localStorage.setItem(`website-image-${uniqueFilename}`, dataUrl);
        resolve(`/images/websites/${uniqueFilename}`);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // Extract filename from path
  const filename = imagePath.split('/').pop();
  if (!filename) return null;
  
  // Get from localStorage (simulating public folder access)
  return localStorage.getItem(`website-image-${filename}`) || null;
};

export const deleteImage = (imagePath: string | null): void => {
  if (!imagePath) return;
  
  const filename = imagePath.split('/').pop();
  if (filename) {
    localStorage.removeItem(`website-image-${filename}`);
  }
};
