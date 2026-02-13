import { ref } from 'vue';
import type { UploadedImage, ExportOptions } from '../types';
import { compressImage, getDataUrlSize } from '../utils/imageCompressor';
import { useToast } from './useToast';

/**
 * 圖片上傳與處理的組合式函數
 * 負責檔案處理、圖片壓縮、狀態管理
 */
export function useImageUpload() {
  const images = ref<UploadedImage[]>([]);
  const isProcessing = ref(false);
  const toast = useToast();

  /**
   * 處理上傳的檔案
   * @param files - 要處理的檔案陣列
   * @param options - 壓縮選項
   */
  async function processFiles(files: File[], options: ExportOptions): Promise<void> {
    isProcessing.value = true;

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.warning('未偵測到圖片檔案，請選擇圖片格式的檔案');
      isProcessing.value = false;
      return;
    }

    for (const file of imageFiles) {
      try {
        // 建立預覽 URL
        const preview = URL.createObjectURL(file);

        // 壓縮圖片
        const compressedDataUrl = await compressImage(file, {
          quality: options.quality,
        });

        // 計算檔案大小
        const originalSize = file.size;
        const compressedSize = getDataUrlSize(compressedDataUrl);

        // 獲取圖片原始尺寸
        const { width, height } = await getImageDimensions(compressedDataUrl);

        // 添加到圖片陣列
        images.value.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          compressedDataUrl,
          originalSize,
          compressedSize,
          width,
          height,
        });
      } catch (error) {
        console.error('處理圖片時發生錯誤:', error);
        toast.error(`處理圖片「${file.name}」時發生錯誤`);
      }
    }

    toast.success(`已成功上傳 ${imageFiles.length} 張圖片`);
    isProcessing.value = false;
  }

  /**
   * 獲取圖片尺寸
   * @param dataUrl - 圖片的 Data URL
   * @returns Promise 包含寬高的物件
   */
  function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * 刪除單張圖片
   * @param id - 要刪除的圖片 ID
   */
  function removeImage(id: string): void {
    const index = images.value.findIndex((img) => img.id === id);
    if (index !== -1) {
      const image = images.value[index];
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      images.value.splice(index, 1);
    }
  }

  /**
   * 清空所有圖片
   */
  function clearAll(): void {
    images.value.forEach((img) => URL.revokeObjectURL(img.preview));
    images.value = [];
  }

  /**
   * 計算總檔案大小
   * @returns 包含原始和壓縮後總大小的物件
   */
  function getTotalSize(): { original: number; compressed: number } {
    const original = images.value.reduce((sum, img) => sum + img.originalSize, 0);
    const compressed = images.value.reduce((sum, img) => sum + img.compressedSize, 0);
    return { original, compressed };
  }

  return {
    images,
    isProcessing,
    processFiles,
    removeImage,
    clearAll,
    getTotalSize,
  };
}
