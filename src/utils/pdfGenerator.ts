import { jsPDF } from 'jspdf';
import type { UploadedImage, ExportOptions, PageSize } from '../types';
import { calculateAspectRatioDimensions } from './docxGenerator';

/**
 * PDF 檔案生成器
 * 將圖片轉換為 PDF 檔案，支援自訂頁面尺寸、浮水印和圖片說明
 */

/**
 * 取得 jsPDF 頁面格式
 */
function getPageFormat(
  pageSize: PageSize,
  customWidth?: number,
  customHeight?: number
): [number, number] | string {
  switch (pageSize) {
    case 'A4':
      return 'a4';
    case 'Letter':
      return 'letter';
    case 'custom':
      return [customWidth || 210, customHeight || 297];
    default:
      return 'a4';
  }
}

/**
 * 生成並下載 PDF 檔案
 */
export async function generatePdf(
  images: UploadedImage[],
  options: ExportOptions
): Promise<void> {
  const { maxWidth, maxHeight, watermarkText } = options;

  const format = getPageFormat(options.pageSize, options.customPageWidth, options.customPageHeight);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt', // 使用 pt 更精確
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeightPt = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;

  let currentY = margin;
  const captionHeight = 20;
  const spacingAfter = 15;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (!image) continue;

    const figureNumber = i + 1;

    try {
      // 計算保持比例的圖片尺寸（從 px 轉換到 pt 比例）
      const { width: scaledW, height: scaledH } = calculateAspectRatioDimensions(
        image.width,
        image.height,
        maxWidth,
        maxHeight
      );

      // 按比例縮放到可用寬度內（pt）
      const scale = Math.min(usableWidth / scaledW, 1);
      const imgWidthPt = scaledW * scale;
      const imgHeightPt = scaledH * scale;

      const totalItemHeight = imgHeightPt + captionHeight + spacingAfter;

      // 判斷是否需要換頁
      if (currentY + totalItemHeight > pageHeightPt - margin && i > 0) {
        pdf.addPage();
        currentY = margin;
      }

      // 繪製浮水印（每頁頂部）
      if (watermarkText && currentY === margin) {
        pdf.setFontSize(10);
        pdf.setTextColor(200, 200, 200);
        pdf.text(watermarkText, pageWidth / 2, 20, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }

      // 繪製圖片（置中）
      const imgX = (pageWidth - imgWidthPt) / 2;
      pdf.addImage(image.compressedDataUrl, 'JPEG', imgX, currentY, imgWidthPt, imgHeightPt, undefined, 'FAST');
      currentY += imgHeightPt + 8;

      // 繪製標題
      const captionText = image.caption?.trim()
        ? `Figure ${figureNumber} - ${image.caption.trim()}`
        : `Figure ${figureNumber}`;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(captionText, pageWidth / 2, currentY, { align: 'center' });
      currentY += captionHeight + spacingAfter;
    } catch (error) {
      console.error(`處理圖片 ${figureNumber} 時發生錯誤:`, error);
    }
  }

  // 下載檔案
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  pdf.save(`images-export-${timestamp}.pdf`);
}
