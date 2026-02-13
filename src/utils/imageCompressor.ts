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
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
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

        // 使用高品質圖片縮放
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 判斷最佳輸出格式
        // PNG 轉 JPEG 可大幅減小檔案
        // 但如果原本就是 JPEG 且檔案小於 500KB，保持原格式
        const isPNG = file.type === 'image/png';
        const isSmallFile = file.size < 500 * 1024; // 小於 500KB

        let outputType = 'image/jpeg';
        let outputQuality = quality;

        // 特殊處理：小 PNG 圖片可能是圖標或截圖，嘗試 JPEG
        if (isPNG) {
          outputType = 'image/jpeg';
          outputQuality = 0.9; // PNG 轉 JPEG 用較高品質
        } else if (file.type === 'image/jpeg') {
          outputType = 'image/jpeg';
        }

        // 轉換為 Blob 並比較大小
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('壓縮失敗'));
              return;
            }

            // 如果壓縮後反而變大，使用原始檔案
            if (blob.size >= file.size) {
              const originalReader = new FileReader();
              originalReader.onloadend = () => {
                resolve(originalReader.result as string);
              };
              originalReader.onerror = reject;
              originalReader.readAsDataURL(file);
              return;
            }

            // 使用壓縮後的檔案
            const compressedReader = new FileReader();
            compressedReader.onloadend = () => {
              resolve(compressedReader.result as string);
            };
            compressedReader.onerror = reject;
            compressedReader.readAsDataURL(blob);
          },
          outputType,
          outputQuality
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
