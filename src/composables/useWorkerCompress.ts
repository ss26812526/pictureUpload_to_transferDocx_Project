import { compressImage as mainThreadCompress } from '../utils/imageCompressor';
import type { CompressOptions } from '../utils/imageCompressor';

let worker: Worker | null = null;
let messageId = 0;
let workerSupported: boolean | null = null;

/**
 * 檢測 OffscreenCanvas 支援（Worker 需要此功能）
 */
function isWorkerSupported(): boolean {
  if (workerSupported !== null) return workerSupported;
  workerSupported = typeof OffscreenCanvas !== 'undefined';
  return workerSupported;
}

/**
 * 取得或建立 Worker 實例
 */
function getWorker(): Worker | null {
  if (!isWorkerSupported()) return null;
  if (!worker) {
    try {
      worker = new Worker(
        new URL('../workers/imageCompressWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch {
      workerSupported = false;
      return null;
    }
  }
  return worker;
}

/**
 * 使用 Web Worker 壓縮圖片（不支援時自動降級到主線程）
 */
export async function compressImageWithWorker(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const w = getWorker();
  if (!w) {
    // 降級到主線程壓縮
    return mainThreadCompress(file, options);
  }

  const { quality = 0.92, maxWidth = 1920, maxHeight = 1920 } = options;
  const id = messageId++;

  return new Promise((resolve, reject) => {
    const arrayBuffer = file.arrayBuffer();

    arrayBuffer
      .then((buffer) => {
        const handler = (e: MessageEvent) => {
          if (e.data.id !== id) return;
          w.removeEventListener('message', handler);

          if (e.data.success) {
            resolve(e.data.dataUrl);
          } else {
            // Worker 失敗時降級到主線程
            mainThreadCompress(file, options).then(resolve).catch(reject);
          }
        };

        w.addEventListener('message', handler);
        w.postMessage(
          {
            id,
            imageData: buffer,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            quality,
            maxWidth,
            maxHeight,
          },
          [buffer]
        );
      })
      .catch(() => {
        // arrayBuffer 失敗時降級
        mainThreadCompress(file, options).then(resolve).catch(reject);
      });
  });
}
