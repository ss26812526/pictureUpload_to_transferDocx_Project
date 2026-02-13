import { ref } from 'vue';
import type { UploadedImage, ExportOptions } from '../types';
import { generateDocx } from '../utils/docxGenerator';
import { generatePdf } from '../utils/pdfGenerator';
import { useToast } from './useToast';

/**
 * 匯出的組合式函數
 * 負責 DOCX 和 PDF 匯出邏輯和狀態管理
 */
export function useImageExport() {
  const isExporting = ref(false);
  const toast = useToast();

  /**
   * 匯出為 DOCX 文件
   */
  async function exportToDocx(
    images: UploadedImage[],
    options: ExportOptions
  ): Promise<void> {
    if (images.length === 0) {
      toast.warning('請先上傳圖片');
      return;
    }

    isExporting.value = true;

    try {
      await generateDocx(images, options);
      toast.success(`已成功匯出 ${images.length} 張圖片為 DOCX`);
    } catch (error) {
      console.error('匯出 DOCX 時發生錯誤:', error);
      toast.error('匯出 DOCX 失敗，請稍後再試');
    } finally {
      isExporting.value = false;
    }
  }

  /**
   * 匯出為 PDF 文件
   */
  async function exportToPdf(
    images: UploadedImage[],
    options: ExportOptions
  ): Promise<void> {
    if (images.length === 0) {
      toast.warning('請先上傳圖片');
      return;
    }

    isExporting.value = true;

    try {
      await generatePdf(images, options);
      toast.success(`已成功匯出 ${images.length} 張圖片為 PDF`);
    } catch (error) {
      console.error('匯出 PDF 時發生錯誤:', error);
      toast.error('匯出 PDF 失敗，請稍後再試');
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    exportToDocx,
    exportToPdf,
  };
}
