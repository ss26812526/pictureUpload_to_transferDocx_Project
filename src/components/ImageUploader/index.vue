<script setup lang="ts">
import { ref } from 'vue';
import type { ExportOptions } from '../../types';
import { useImageUpload } from '../../composables/useImageUpload';
import { useImageExport } from '../../composables/useImageExport';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import UploadZone from './UploadZone.vue';
import StatsPanel from './StatsPanel.vue';
import ExportSettings from './ExportSettings.vue';
import ImageGrid from './ImageGrid.vue';
import ActionButtons from './ActionButtons.vue';

/**
 * 圖片上傳器主容器組件
 * 整合所有子組件,管理頂層狀態
 */

// 使用 composables
const { images, isProcessing, processFiles, removeImage, clearAll } = useImageUpload();
const { isExporting, exportToDocx } = useImageExport();

// 匯出選項
const exportOptions = ref<ExportOptions>({
  maxWidth: 500,
  maxHeight: 400,
  quality: 0.92,
  maxPageHeight: 800,
});

// 處理上傳
async function handleUpload(files: File[]) {
  await processFiles(files, exportOptions.value);
}

// 處理匯出
async function handleExport() {
  await exportToDocx(images.value, exportOptions.value);
}

// 計算是否正在處理
const isBusy = () => isProcessing.value || isExporting.value;
</script>

<template>
  <div class="image-uploader">
    <!-- Header -->
    <div class="header">
      <h1>📸 圖片上傳與 DOCX 匯出</h1>
      <p class="subtitle">上傳圖片、自動排版、一鍵匯出成 Word 文件</p>
    </div>

    <!-- 上傳區域 -->
    <UploadZone :disabled="isBusy()" @upload="handleUpload" />

    <!-- 統計資訊 -->
    <StatsPanel :images="images" />

    <!-- 匯出設定 -->
    <ExportSettings v-if="images.length > 0" v-model="exportOptions" />

    <!-- 圖片網格 -->
    <ImageGrid :images="images" @remove="removeImage" />

    <!-- 操作按鈕 -->
    <ActionButtons
      :disabled="isBusy()"
      :image-count="images.length"
      @clear="clearAll"
      @export="handleExport"
    />

    <!-- 空狀態提示 -->
    <div v-if="images.length === 0 && !isProcessing" class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p class="empty-text">尚未上傳任何圖片</p>
      <p class="empty-hint">點擊上方區域開始上傳</p>
    </div>

    <!-- 載入中遮罩 -->
    <LoadingOverlay :show="isBusy()" />
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
</style>
