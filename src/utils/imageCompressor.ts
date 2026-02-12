/**
 * 圖片壓縮工具
 * 使用 Canvas API 進行高品質壓縮，保持圖片清晰度但減少檔案大小
 */

export interface CompressOptions {
  quality?: number; // 壓縮品質 0.1-1.0，預設 0.92
  maxWidth?: number; // 最大寬度
  maxHeight?: number; // 最大高度
}

/**
 * 壓縮圖片檔案
 * @param file 原始圖片檔案
 * @param options 壓縮選項
 * @returns Promise<壓縮後的 Data URL>
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { quality = 0.92, maxWidth = 1920, maxHeight = 1920 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 計算縮放比例
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // 建立 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法取得 Canvas context'));
          return;
        }

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 Data URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('壓縮失敗'));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          file.type || 'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}

/**
 * 取得 Data URL 的檔案大小（bytes）
 */
export function getDataUrlSize(dataUrl: string): number {
  // Data URL 格式: data:image/jpeg;base64,xxxxx
  const base64String = dataUrl.split(',')[1];
  if (!base64String) return 0;

  // Base64 編碼後的大小約為原始大小的 4/3
  return Math.floor((base64String.length * 3) / 4);
}

/**
 * 格式化檔案大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
