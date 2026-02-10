import { CompressionSettings } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const compressImage = async (
  file: File,
  settings: CompressionSettings
): Promise<{ blob: Blob; width: number; height: number; url: string }> => {
  const imageUrl = URL.createObjectURL(file);
  const img = await loadImage(imageUrl);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error('Could not get canvas context');
  }

  // Calculate new dimensions
  let newWidth = settings.width;
  let newHeight = settings.height;

  if (settings.maintainAspectRatio) {
    const ratio = img.width / img.height;
    if (newWidth !== img.width && newHeight === img.height) {
       // Width changed, adjust height
       newHeight = Math.round(newWidth / ratio);
    } else if (newHeight !== img.height && newWidth === img.width) {
       // Height changed, adjust width
       newWidth = Math.round(newHeight * ratio);
    } else if (newWidth !== img.width && newHeight !== img.height) {
       // Both changed, fit within box (cover logic usually, or just strict resize? Let's do loose strict)
       // If strict dimensions are requested, we stretch. 
       // If maintainAspectRatio is true, we usually prioritize Width.
       newHeight = Math.round(newWidth / ratio);
    }
  }

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Better quality resizing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  URL.revokeObjectURL(imageUrl);

  let quality = settings.quality;
  let blob: Blob | null = null;

  // Helper to get blob
  const getBlob = async (q: number): Promise<Blob> => {
    return new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        settings.format,
        q
      );
    });
  };

  // If target size is set, we binary search or iterate for the best quality
  if (settings.targetSizeKB && settings.targetSizeKB > 0) {
    const targetBytes = settings.targetSizeKB * 1024;
    let minQ = 0.01;
    let maxQ = 1.0;
    let bestBlob: Blob | null = null;

    // Simple binary search 
    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const currentBlob = await getBlob(midQ);
      
      if (currentBlob.size <= targetBytes) {
        bestBlob = currentBlob;
        minQ = midQ; // Try for better quality
      } else {
        maxQ = midQ; // Too big, reduce quality
      }
    }
    
    // If we found a valid blob under size, use it. Otherwise use lowest quality.
    blob = bestBlob || await getBlob(0.1); 
  } else {
    // Standard quality-based compression
    blob = await getBlob(quality);
  }

  return {
    blob,
    width: newWidth,
    height: newHeight,
    url: URL.createObjectURL(blob)
  };
};

export const fileToDataURL = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
