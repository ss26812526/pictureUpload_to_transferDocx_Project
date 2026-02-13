import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UploadedImage, ExportOptions } from '../types';
import { getDataUrlSize } from '../utils/imageCompressor';
import { compressImageWithWorker } from '../composables/useWorkerCompress';
import { useToast } from '../composables/useToast';

/**
 * 圖片管理 Pinia Store
 * 集中管理圖片狀態、上傳、刪除、Undo/Redo
 */
export const useImageStore = defineStore('images', () => {
  const toast = useToast();

  // ===== 核心狀態 =====
  const images = ref<UploadedImage[]>([]);
  const isProcessing = ref(false);

  // ===== Undo/Redo =====
  const undoStack = ref<UploadedImage[][]>([]);
  const redoStack = ref<UploadedImage[][]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  function pushUndoSnapshot() {
    undoStack.value.push(JSON.parse(JSON.stringify(images.value)));
    redoStack.value = [];
  }

  function undo() {
    const snapshot = undoStack.value.pop();
    if (!snapshot) {
      toast.info('沒有可撤銷的操作');
      return;
    }
    redoStack.value.push(JSON.parse(JSON.stringify(images.value)));
    images.value.splice(0, images.value.length, ...snapshot);
    toast.info('已撤銷');
  }

  function redo() {
    const snapshot = redoStack.value.pop();
    if (!snapshot) {
      toast.info('沒有可重做的操作');
      return;
    }
    undoStack.value.push(JSON.parse(JSON.stringify(images.value)));
    images.value.splice(0, images.value.length, ...snapshot);
    toast.info('已重做');
  }

  // ===== 批次選取 =====
  const selectedIds = ref<Set<string>>(new Set());
  const isSelectMode = ref(false);
  const selectedCount = computed(() => selectedIds.value.size);

  function toggleSelectMode() {
    isSelectMode.value = !isSelectMode.value;
    if (!isSelectMode.value) {
      selectedIds.value.clear();
    }
  }

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  }

  function selectAll() {
    images.value.forEach((img) => selectedIds.value.add(img.id));
  }

  function deselectAll() {
    selectedIds.value.clear();
  }

  function batchRemove() {
    if (selectedIds.value.size === 0) {
      toast.warning('請先選取要刪除的圖片');
      return;
    }
    const count = selectedIds.value.size;
    pushUndoSnapshot();
    selectedIds.value.forEach((id) => {
      const index = images.value.findIndex((img) => img.id === id);
      if (index !== -1) {
        const image = images.value[index];
        if (image) URL.revokeObjectURL(image.preview);
        images.value.splice(index, 1);
      }
    });
    selectedIds.value.clear();
    toast.success(`已批次刪除 ${count} 張圖片`);
  }

  // ===== 圖片操作 =====
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
        const preview = URL.createObjectURL(file);
        const compressedDataUrl = await compressImageWithWorker(file, {
          quality: options.quality,
        });
        const originalSize = file.size;
        const compressedSize = getDataUrlSize(compressedDataUrl);
        const { width, height } = await getImageDimensions(compressedDataUrl);

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

  function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function removeImage(id: string) {
    pushUndoSnapshot();
    const index = images.value.findIndex((img) => img.id === id);
    if (index !== -1) {
      const image = images.value[index];
      if (image) URL.revokeObjectURL(image.preview);
      images.value.splice(index, 1);
    }
    selectedIds.value.delete(id);
    toast.info('已刪除圖片');
  }

  function clearAll() {
    pushUndoSnapshot();
    const count = images.value.length;
    images.value.forEach((img) => URL.revokeObjectURL(img.preview));
    images.value = [];
    selectedIds.value.clear();
    toast.success(`已清空 ${count} 張圖片`);
  }

  function updateCaption(id: string, caption: string) {
    const img = images.value.find((i) => i.id === id);
    if (img) img.caption = caption;
  }

  // ===== 統計 =====
  const totalOriginalSize = computed(() =>
    images.value.reduce((sum, img) => sum + img.originalSize, 0)
  );
  const totalCompressedSize = computed(() =>
    images.value.reduce((sum, img) => sum + img.compressedSize, 0)
  );

  return {
    // 狀態
    images,
    isProcessing,
    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,
    pushUndoSnapshot,
    // 批次選取
    selectedIds,
    isSelectMode,
    selectedCount,
    toggleSelectMode,
    toggleSelect,
    selectAll,
    deselectAll,
    batchRemove,
    // 圖片操作
    processFiles,
    removeImage,
    clearAll,
    updateCaption,
    // 統計
    totalOriginalSize,
    totalCompressedSize,
  };
});
