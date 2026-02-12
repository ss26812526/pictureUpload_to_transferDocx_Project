export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export interface ExportOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxPageHeight: number; // 每頁最大累計高度（px）
}
