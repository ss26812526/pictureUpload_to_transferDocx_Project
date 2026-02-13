/**
 * Web Worker: 圖片壓縮
 * 使用 OffscreenCanvas 在 Worker 線程中進行壓縮，避免阻塞 UI
 */

interface CompressMessage {
  id: number;
  imageData: ArrayBuffer;
  fileName: string;
  fileType: string;
  fileSize: number;
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

interface CompressResult {
  id: number;
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * 將 Blob 轉為 Data URL（使用 FileReader async 版本）
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

self.onmessage = async (e: MessageEvent<CompressMessage>) => {
  const { id, imageData, fileType, fileSize, quality, maxWidth, maxHeight } = e.data;

  try {
    // 將 ArrayBuffer 轉成 Blob 再轉成 ImageBitmap
    const blob = new Blob([imageData], { type: fileType });
    const bitmap = await createImageBitmap(blob);

    // 計算縮放比例
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // 使用 OffscreenCanvas 壓縮
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('無法取得 OffscreenCanvas context');

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // 輸出為 JPEG（壓縮效果最好）
    const outputQuality = fileType === 'image/png' ? 0.9 : quality;
    const compressedBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: outputQuality,
    });

    // 如果壓縮後反而更大，使用原始檔案
    const finalBlob = compressedBlob.size >= fileSize ? blob : compressedBlob;

    // 轉為 Data URL
    const dataUrl = await blobToDataUrl(finalBlob);

    const result: CompressResult = { id, success: true, dataUrl };
    self.postMessage(result);
  } catch (error) {
    const result: CompressResult = {
      id,
      success: false,
      error: error instanceof Error ? error.message : '壓縮失敗',
    };
    self.postMessage(result);
  }
};
