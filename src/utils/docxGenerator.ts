import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  AlignmentType,
  TextRun,
} from 'docx';
import { saveAs } from 'file-saver';
import type { UploadedImage, ExportOptions } from '../types';

/**
 * DOCX 檔案生成器
 * 將圖片轉換為 DOCX 檔案，每張圖片自動命名為 "Figure 1"、"Figure 2" 等
 */

/**
 * 從 Data URL 中取得圖片類型
 */
function getImageTypeFromDataUrl(dataUrl: string): 'jpg' | 'png' | 'gif' | 'bmp' {
  if (dataUrl.includes('image/png')) return 'png';
  if (dataUrl.includes('image/gif')) return 'gif';
  if (dataUrl.includes('image/bmp')) return 'bmp';
  return 'jpg'; // 預設使用 jpg
}

/**
 * 將 Data URL 轉換為 Uint8Array
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL format');
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * 計算保持比例的圖片尺寸
 * @param originalWidth 原始寬度
 * @param originalHeight 原始高度
 * @param maxWidth 最大寬度
 * @param maxHeight 最大高度
 * @returns 調整後的寬高
 */
function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // 如果寬度超過最大值，按寬度縮放
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 如果高度還是超過最大值，按高度縮放
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

/**
 * 生成並下載 DOCX 檔案
 * @param images 上傳的圖片陣列
 * @param options 匯出選項
 */
export async function generateDocx(
  images: UploadedImage[],
  options: ExportOptions
): Promise<void> {
  const { maxWidth, maxHeight, maxPageHeight } = options;

  // 建立段落陣列
  const children: Paragraph[] = [];

  // 智能分頁：追蹤當前頁面累計高度
  let currentPageHeight = 0;
  const captionHeight = 30; // Figure 標題估計高度
  const spacing = 20; // 圖片間距

  // 為每張圖片建立段落
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (!image) continue; // 跳過 undefined

    const figureNumber = i + 1;

    try {
      // 取得圖片類型
      const imageType = getImageTypeFromDataUrl(image.compressedDataUrl);

      // 將壓縮後的圖片轉換為 Uint8Array
      const imageBuffer = dataUrlToUint8Array(image.compressedDataUrl);

      // 計算保持比例的圖片尺寸
      const { width, height } = calculateAspectRatioDimensions(
        image.width,
        image.height,
        maxWidth,
        maxHeight
      );

      // 計算此圖片（含標題和間距）的總高度
      const totalItemHeight = height + captionHeight + spacing;

      // 智能分頁：如果加上這張圖片會超過頁面高度，且不是第一張圖片，則分頁
      if (currentPageHeight + totalItemHeight > maxPageHeight && i > 0) {
        // 添加分頁符
        children.push(
          new Paragraph({
            pageBreakBefore: true,
          })
        );
        // 重置頁面高度
        currentPageHeight = 0;
      }

      // 建立圖片段落
      const imageParagraph = new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            type: imageType,
            transformation: {
              width,
              height,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 100,
        },
      });

      // 建立 Figure 標題段落
      const captionParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Figure ${figureNumber}`,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        },
      });

      // 添加圖片和標題
      children.push(imageParagraph);
      children.push(captionParagraph);

      // 更新當前頁面累計高度
      currentPageHeight += totalItemHeight;
    } catch (error) {
      console.error(`處理圖片 ${figureNumber} 時發生錯誤:`, error);
    }
  }

  // 建立文件
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // 生成並下載檔案
  try {
    const blob = await Packer.toBlob(doc);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    saveAs(blob, `images-export-${timestamp}.docx`);
  } catch (error) {
    console.error('生成 DOCX 檔案時發生錯誤:', error);
    throw error;
  }
}
