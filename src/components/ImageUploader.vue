<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Sortable from 'sortablejs';
import type { UploadedImage, ExportOptions } from '../types';
import { compressImage, getDataUrlSize, formatFileSize } from '../utils/imageCompressor';
import { generateDocx } from '../utils/docxGenerator';

// 狀態管理
const images = ref<UploadedImage[]>([]);
const isDragging = ref(false);
const isProcessing = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageGridRef = ref<HTMLElement | null>(null);

// 匯出選項
const exportOptions = ref<ExportOptions>({
  maxWidth: 500,
  maxHeight: 400,
  quality: 0.92,
  maxPageHeight: 800, // 智能分頁：每頁最大累計高度
});

let sortableInstance: Sortable | null = null;

// 初始化拖拽排序
onMounted(() => {
  if (imageGridRef.value) {
    sortableInstance = Sortable.create(imageGridRef.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt: Sortable.SortableEvent) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const movedImage = images.value.splice(evt.oldIndex, 1)[0];
          if (movedImage) {
            images.value.splice(evt.newIndex, 0, movedImage);
          }
        }
      },
    });
  }
});

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy();
  }
});

// 處理檔案選擇
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    await processFiles(Array.from(target.files));
  }
}

// 處理拖拽上傳
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  if (event.dataTransfer?.files) {
    await processFiles(Array.from(event.dataTransfer.files));
  }
}

// 處理上傳的檔案
async function processFiles(files: File[]) {
  isProcessing.value = true;

  const imageFiles = files.filter((file) => file.type.startsWith('image/'));

  for (const file of imageFiles) {
    try {
      // 建立預覽 URL
      const preview = URL.createObjectURL(file);

      // 壓縮圖片
      const compressedDataUrl = await compressImage(file, {
        quality: exportOptions.value.quality,
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
    }
  }

  isProcessing.value = false;

  // 重置 input
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// 獲取圖片尺寸
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

// 刪除圖片
function removeImage(id: string) {
  const index = images.value.findIndex((img) => img.id === id);
  if (index !== -1) {
    const image = images.value[index];
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    images.value.splice(index, 1);
  }
}

// 清空所有圖片
function clearAll() {
  images.value.forEach((img) => URL.revokeObjectURL(img.preview));
  images.value = [];
}

// 匯出為 DOCX
async function exportToDocx() {
  if (images.value.length === 0) {
    alert('請先上傳圖片');
    return;
  }

  isProcessing.value = true;

  try {
    await generateDocx(images.value, exportOptions.value);
  } catch (error) {
    console.error('匯出 DOCX 時發生錯誤:', error);
    alert('匯出失敗，請稍後再試');
  } finally {
    isProcessing.value = false;
  }
}

// 計算總檔案大小
function getTotalSize() {
  const original = images.value.reduce((sum, img) => sum + img.originalSize, 0);
  const compressed = images.value.reduce((sum, img) => sum + img.compressedSize, 0);
  return { original, compressed };
}

// 觸發檔案選擇
function triggerFileInput() {
  fileInputRef.value?.click();
}
</script>

<template>
  <div class="image-uploader">
    <div class="header">
      <h1>📸 圖片上傳與 DOCX 匯出</h1>
      <p class="subtitle">上傳圖片、自動排版、一鍵匯出成 Word 文件</p>
    </div>

    <!-- 上傳區域 -->
    <div
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      />
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">點擊或拖拽圖片到此處上傳</p>
        <p class="upload-hint">支援 JPG、PNG、GIF 等格式</p>
      </div>
    </div>

    <!-- 統計資訊 -->
    <div v-if="images.length > 0" class="stats">
      <div class="stat-item">
        <span class="stat-label">已上傳圖片：</span>
        <span class="stat-value">{{ images.length }} 張</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">原始大小：</span>
        <span class="stat-value">{{ formatFileSize(getTotalSize().original) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">壓縮後：</span>
        <span class="stat-value compressed">{{ formatFileSize(getTotalSize().compressed) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">節省：</span>
        <span class="stat-value savings">
          {{ Math.round((1 - getTotalSize().compressed / getTotalSize().original) * 100) }}%
        </span>
      </div>
    </div>

    <!-- 匯出設定 -->
    <div v-if="images.length > 0" class="export-settings">
      <h3>⚙️ 匯出設定</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <label>圖片最大寬度 (px)：</label>
          <input
            v-model.number="exportOptions.maxWidth"
            type="number"
            min="100"
            max="800"
            step="50"
          />
        </div>
        <div class="setting-item">
          <label>圖片最大高度 (px)：</label>
          <input
            v-model.number="exportOptions.maxHeight"
            type="number"
            min="100"
            max="800"
            step="50"
          />
        </div>
        <div class="setting-item">
          <label>每頁累計高度 (px)：</label>
          <input
            v-model.number="exportOptions.maxPageHeight"
            type="number"
            min="400"
            max="2000"
            step="100"
          />
          <span class="hint-text">🤖 智能分頁</span>
        </div>
        <div class="setting-item">
          <label>壓縮品質：</label>
          <input
            v-model.number="exportOptions.quality"
            type="range"
            min="0.5"
            max="1"
            step="0.05"
          />
          <span class="quality-value">{{ Math.round(exportOptions.quality * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- 圖片預覽網格 -->
    <div v-if="images.length > 0" class="image-grid" ref="imageGridRef">
      <div v-for="(image, index) in images" :key="image.id" class="image-card">
        <div class="image-wrapper">
          <img :src="image.preview" :alt="`Image ${index + 1}`" />
          <div class="image-overlay">
            <button class="remove-btn" @click.stop="removeImage(image.id)" title="刪除">
              ❌
            </button>
          </div>
        </div>
        <div class="image-info">
          <p class="image-number">Figure {{ index + 1 }}</p>
          <p class="image-size">
            {{ formatFileSize(image.originalSize) }} →
            {{ formatFileSize(image.compressedSize) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div v-if="images.length > 0" class="actions">
      <button class="btn btn-secondary" @click="clearAll" :disabled="isProcessing">
        🗑️ 清空所有圖片
      </button>
      <button class="btn btn-primary" @click="exportToDocx" :disabled="isProcessing">
        <span v-if="isProcessing">⏳ 處理中...</span>
        <span v-else>📥 匯出 DOCX</span>
      </button>
    </div>

    <!-- 空狀態提示 -->
    <div v-if="images.length === 0 && !isProcessing" class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p class="empty-text">尚未上傳任何圖片</p>
      <p class="empty-hint">點擊上方區域開始上傳</p>
    </div>

    <!-- 載入中 -->
    <div v-if="isProcessing" class="loading-overlay">
      <div class="spinner"></div>
      <p>處理中，請稍候...</p>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* 上傳區域 */
.upload-zone {
  border: 3px dashed #ccc;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin-bottom: 2rem;
}

.upload-zone:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  transform: translateY(-2px);
}

.upload-zone.dragging {
  border-color: #667eea;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  transform: scale(1.02);
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.upload-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0.5rem 0;
}

.upload-hint {
  color: #3d3d5c;
  font-size: 0.95rem;
  margin: 0;
}

/* 統計資訊 */
.stats {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.stat-value.compressed {
  color: #a8edea;
}

.stat-value.savings {
  color: #fed6e3;
}

/* 匯出設定 */
.export-settings {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.export-settings h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.setting-item input[type='number'],
.setting-item input[type='range'] {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.setting-item input[type='number']:focus,
.setting-item input[type='range']:focus {
  outline: none;
  border-color: #667eea;
}

.quality-value {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  text-align: center;
}

.hint-text {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
  text-align: center;
  margin-top: 0.25rem;
}

/* 圖片網格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: move;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f5f5f5;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn:hover {
  transform: scale(1.1);
  background: white;
}

.image-info {
  padding: 1rem;
  text-align: center;
}

.image-number {
  font-weight: 700;
  color: #667eea;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.image-size {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

/* 操作按鈕 */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(245, 87, 108, 0.4);
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

/* 載入中 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sortable 樣式 */
.sortable-ghost {
  opacity: 0.4;
}

.sortable-chosen {
  transform: scale(1.05);
}

.sortable-drag {
  opacity: 0.8;
}
</style>
