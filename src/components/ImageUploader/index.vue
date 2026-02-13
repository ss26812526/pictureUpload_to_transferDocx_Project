<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { ExportOptions } from '../../types';
import { useImageStore } from '../../stores/imageStore';
import { useImageExport } from '../../composables/useImageExport';
import { useI18n } from '../../i18n';
import type { Locale } from '../../i18n';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import ImageLightbox from '../common/ImageLightbox.vue';
import UploadZone from './UploadZone.vue';
import StatsPanel from './StatsPanel.vue';
import ExportSettings from './ExportSettings.vue';
import ImageGrid from './ImageGrid.vue';
import ActionButtons from './ActionButtons.vue';

/**
 * 圖片上傳器主容器組件
 * 使用 Pinia Store 管理狀態，整合所有子組件
 */

const store = useImageStore();
const { isExporting, exportToDocx, exportToPdf } = useImageExport();
const { locale, t } = useI18n();

function switchLocale(newLocale: Locale) {
  locale.value = newLocale;
}

// 匯出選項
const exportOptions = ref<ExportOptions>({
  maxWidth: 500,
  maxHeight: 400,
  quality: 0.92,
  maxPageHeight: 800,
  pageSize: 'A4',
  watermarkText: '',
});

// ===== Lightbox =====
const lightboxIndex = ref(-1);
const lightboxSrc = ref('');

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxSrc.value = store.images[index]?.preview || '';
  nextTick(() => {
    const overlay = document.querySelector('.lightbox-overlay') as HTMLElement;
    overlay?.focus();
  });
}

function closeLightbox() {
  lightboxIndex.value = -1;
  lightboxSrc.value = '';
}

function prevImage() {
  if (store.images.length === 0) return;
  const newIndex = (lightboxIndex.value - 1 + store.images.length) % store.images.length;
  openLightbox(newIndex);
}

function nextImage() {
  if (store.images.length === 0) return;
  const newIndex = (lightboxIndex.value + 1) % store.images.length;
  openLightbox(newIndex);
}

// ===== 事件處理 =====
async function handleUpload(files: File[]) {
  await store.processFiles(files, exportOptions.value);
}

async function handleExport() {
  await exportToDocx(store.images, exportOptions.value);
}

async function handleExportPdf() {
  await exportToPdf(store.images, exportOptions.value);
}

function handleRemove(id: string) {
  store.removeImage(id);
  if (lightboxIndex.value >= 0) closeLightbox();
}

const isBusy = () => store.isProcessing || isExporting.value;
</script>

<template>
  <div class="image-uploader">
    <!-- Header -->
    <div class="header">
      <div class="locale-switcher">
        <button
          class="locale-btn"
          :class="{ active: locale === 'zh-TW' }"
          @click="switchLocale('zh-TW')"
        >
          中文
        </button>
        <button
          class="locale-btn"
          :class="{ active: locale === 'en' }"
          @click="switchLocale('en')"
        >
          EN
        </button>
      </div>
      <h1>{{ t('app.title') }}</h1>
      <p class="subtitle">{{ t('app.subtitle') }}</p>
    </div>

    <!-- 上傳區域 -->
    <UploadZone :disabled="isBusy()" @upload="handleUpload" />

    <!-- 統計資訊 -->
    <StatsPanel :images="store.images" />

    <!-- 工具列：批次選取 / Undo / Redo -->
    <div v-if="store.images.length > 0" class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" :class="{ active: store.isSelectMode }" @click="store.toggleSelectMode">
          {{ store.isSelectMode ? t('toolbar.exitSelect') : t('toolbar.batchSelect') }}
        </button>
        <template v-if="store.isSelectMode">
          <button class="tool-btn" @click="store.selectAll">{{ t('toolbar.selectAll') }}</button>
          <button class="tool-btn" @click="store.deselectAll">{{ t('toolbar.deselectAll') }}</button>
          <button class="tool-btn danger" @click="store.batchRemove" :disabled="store.selectedCount === 0">
            {{ t('toolbar.deleteSelected').replace('{count}', String(store.selectedCount)) }}
          </button>
        </template>
      </div>
      <div class="toolbar-right">
        <button class="tool-btn" @click="store.undo" :disabled="!store.canUndo" :title="t('toolbar.undo')">
          {{ t('toolbar.undo') }}
        </button>
        <button class="tool-btn" @click="store.redo" :disabled="!store.canRedo" :title="t('toolbar.redo')">
          {{ t('toolbar.redo') }}
        </button>
      </div>
    </div>

    <!-- 匯出設定 -->
    <ExportSettings v-if="store.images.length > 0" v-model="exportOptions" />

    <!-- 圖片網格 -->
    <ImageGrid
      :images="store.images"
      :select-mode="store.isSelectMode"
      :selected-ids="store.selectedIds"
      @remove="handleRemove"
      @preview="openLightbox"
      @toggle-select="store.toggleSelect"
      @update-caption="store.updateCaption"
    />

    <!-- 操作按鈕 -->
    <ActionButtons
      :disabled="isBusy()"
      :image-count="store.images.length"
      @clear="store.clearAll"
      @export="handleExport"
      @export-pdf="handleExportPdf"
    />

    <!-- 圖片 Lightbox 預覽 -->
    <ImageLightbox
      :src="lightboxSrc"
      :current-index="lightboxIndex"
      :total="store.images.length"
      @close="closeLightbox"
      @prev="prevImage"
      @next="nextImage"
    />

    <!-- 空狀態提示 -->
    <div v-if="store.images.length === 0 && !store.isProcessing" class="empty-state">
      <div class="empty-icon">{{ t('empty.icon') }}</div>
      <p class="empty-text">{{ t('empty.title') }}</p>
      <p class="empty-hint">{{ t('empty.hint') }}</p>
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
  position: relative;
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

/* 語言切換 */
.locale-switcher {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 3px;
}

.locale-btn {
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locale-btn:hover {
  color: white;
}

.locale-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* 工具列 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  background: #f0f0ff;
}

.tool-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.tool-btn.danger {
  border-color: #f5576c;
  color: #f5576c;
}

.tool-btn.danger:hover:not(:disabled) {
  background: #f5576c;
  color: white;
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
