import { ref } from 'vue';
import type { UploadedImage, ExportOptions } from '../types';
import { generateDocx } from '../utils/docxGenerator';

/**
 * DOCX 匯出的組合式函數
 * 負責匯出邏輯和狀態管理
 */
export function useImageExport() {
  const isExporting = ref(false);

  /**
   * 匯出為 DOCX 文件
   * @param images - 要匯出的圖片陣列
   * @param options - 匯出選項
   */
  async function exportToDocx(
    images: UploadedImage[],
    options: ExportOptions
  ): Promise<void> {
    if (images.length === 0) {
      alert('請先上傳圖片');
      return;
    }

    isExporting.value = true;

    try {
      await generateDocx(images, options);
    } catch (error) {
      console.error('匯出 DOCX 時發生錯誤:', error);
      alert('匯出失敗,請稍後再試');
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    exportToDocx,
  };
}
