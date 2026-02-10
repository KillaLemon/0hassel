export type ResizeUnit = 'px' | '%' | 'in' | 'cm' | 'mm';

export interface CompressionSettings {
  quality: number; // 0 to 1
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  outputExtension: 'jpg' | 'jpeg' | 'png' | 'webp';
  targetSizeKB: number | null; // If set, overrides quality to try and match size
  resizeUnit: ResizeUnit;
}

export interface ImageState {
  originalUrl: string | null;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
  name: string;
  isProcessing: boolean;
}

export interface AdProps {
  type: 'banner' | 'sidebar' | 'square';
  className?: string;
}