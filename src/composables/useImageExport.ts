import { ref } from 'vue';
import type { UploadedImage, ExportOptions } from '../types';
import { generateDocx } from '../utils/docxGenerator';
import { generatePdf } from '../utils/pdfGenerator';
import { useToast } from './useToast';
import { useI18n } from '../i18n';

/**
 * 匯出的組合式函數
 * 負責 DOCX 和 PDF 匯出邏輯和狀態管理
 */
export function useImageExport() {
  const isExporting = ref(false);
  const toast = useToast();
  const { t } = useI18n();

  /**
   * 匯出為 DOCX 文件
   */
  async function exportToDocx(
    images: UploadedImage[],
    options: ExportOptions
  ): Promise<void> {
    if (images.length === 0) {
      toast.warning(t('toast.uploadFirst'));
      return;
    }

    isExporting.value = true;

    try {
      await generateDocx(images, options);
      toast.success(t('toast.exportDocxSuccess').replace('{count}', String(images.length)));
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error(t('toast.exportDocxFail'));
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
      toast.warning(t('toast.uploadFirst'));
      return;
    }

    isExporting.value = true;

    try {
      await generatePdf(images, options);
      toast.success(t('toast.exportPdfSuccess').replace('{count}', String(images.length)));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('toast.exportPdfFail'));
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
