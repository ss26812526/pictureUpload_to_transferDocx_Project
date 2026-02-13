import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  AlignmentType,
  TextRun,
  Header,
  PageOrientation,
  convertMillimetersToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import type { UploadedImage, ExportOptions, PageSize } from '../types';

/**
 * DOCX 檔案生成器
 * 將圖片轉換為 DOCX 檔案，支援自訂頁面尺寸、浮水印和圖片說明
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
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
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
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

/**
 * 取得頁面尺寸（mm）
 */
function getPageDimensions(
  pageSize: PageSize,
  customWidth?: number,
  customHeight?: number
): { width: number; height: number } {
  switch (pageSize) {
    case 'A4':
      return { width: 210, height: 297 };
    case 'Letter':
      return { width: 216, height: 279 };
    case 'custom':
      return { width: customWidth || 210, height: customHeight || 297 };
    default:
      return { width: 210, height: 297 };
  }
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
  const { maxWidth, maxHeight, maxPageHeight, watermarkText } = options;

  // 取得頁面尺寸
  const pageDims = getPageDimensions(
    options.pageSize,
    options.customPageWidth,
    options.customPageHeight
  );

  // 建立段落陣列
  const children: Paragraph[] = [];

  // 智能分頁：追蹤當前頁面累計高度
  let currentPageHeight = 0;
  const captionHeight = 30;
  const spacing = 20;

  // 為每張圖片建立段落
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (!image) continue;

    const figureNumber = i + 1;

    try {
      const imageType = getImageTypeFromDataUrl(image.compressedDataUrl);
      const imageBuffer = dataUrlToUint8Array(image.compressedDataUrl);
      const { width, height } = calculateAspectRatioDimensions(
        image.width,
        image.height,
        maxWidth,
        maxHeight
      );

      const totalItemHeight = height + captionHeight + spacing;

      if (currentPageHeight + totalItemHeight > maxPageHeight && i > 0) {
        children.push(
          new Paragraph({
            pageBreakBefore: true,
          })
        );
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

      // 建立標題段落（優先使用自訂說明）
      const captionText = image.caption?.trim()
        ? `Figure ${figureNumber} - ${image.caption.trim()}`
        : `Figure ${figureNumber}`;

      const captionParagraph = new Paragraph({
        children: [
          new TextRun({
            text: captionText,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        },
      });

      children.push(imageParagraph);
      children.push(captionParagraph);

      currentPageHeight += totalItemHeight;
    } catch (error) {
      console.error(`處理圖片 ${figureNumber} 時發生錯誤:`, error);
    }
  }

  // 浮水印 header（如有設定）
  const headers = watermarkText
    ? {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: watermarkText,
                  color: 'CCCCCC',
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      }
    : undefined;

  // 建立文件
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(pageDims.width),
              height: convertMillimetersToTwip(pageDims.height),
              orientation: PageOrientation.PORTRAIT,
            },
          },
        },
        headers,
        children,
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
