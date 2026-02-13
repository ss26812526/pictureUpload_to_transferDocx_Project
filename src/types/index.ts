export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  caption?: string; // 自訂圖片說明文字
}

export type PageSize = 'A4' | 'Letter' | 'custom';

export interface ExportOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxPageHeight: number; // 每頁最大累計高度（px）
  pageSize: PageSize;
  customPageWidth?: number; // 自訂頁面寬度 (mm)
  customPageHeight?: number; // 自訂頁面高度 (mm)
  watermarkText: string; // 浮水印文字（空字串表示不加）
}
