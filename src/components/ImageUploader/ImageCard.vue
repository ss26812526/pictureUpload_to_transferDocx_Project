<script setup lang="ts">
import type { UploadedImage } from '../../types';
import { formatFileSize } from '../../utils/imageCompressor';

/**
 * 單張圖片卡片組件
 * 顯示圖片預覽、編號、大小資訊和刪除按鈕
 * 支援批次選取模式和圖片說明編輯
 */
const props = defineProps<{
  image: UploadedImage;
  index: number;
  selectMode?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  remove: [id: string];
  preview: [index: number];
  toggleSelect: [id: string];
  updateCaption: [id: string, caption: string];
}>();

function handleCardClick() {
  if (props.selectMode) {
    emit('toggleSelect', props.image.id);
  }
}
</script>

<template>
  <div
    class="image-card"
    :class="{ 'select-mode': selectMode, selected }"
    @click="handleCardClick"
  >
    <!-- 選取勾選框 -->
    <div v-if="selectMode" class="select-checkbox" :class="{ checked: selected }">
      <span v-if="selected">✓</span>
    </div>

    <div class="drag-handle" title="拖拽以調整順序">
      <span class="drag-icon">⋮⋮</span>
    </div>
    <div
      class="image-wrapper"
      @click.stop="!selectMode && emit('preview', index)"
      :title="selectMode ? '點擊選取' : '點擊預覽大圖'"
    >
      <img :src="image.preview" :alt="`Image ${index + 1}`" />
      <div v-if="!selectMode" class="image-overlay">
        <span class="preview-icon">🔍</span>
        <button class="remove-btn" @click.stop="emit('remove', image.id)" title="刪除">❌</button>
      </div>
    </div>
    <div class="image-info">
      <p class="image-number">Figure {{ index + 1 }}</p>
      <p class="image-size">
        {{ formatFileSize(image.originalSize) }} → {{ formatFileSize(image.compressedSize) }}
      </p>
      <input
        class="caption-input"
        type="text"
        :value="image.caption || ''"
        @input="emit('updateCaption', image.id, ($event.target as HTMLInputElement).value)"
        @click.stop
        placeholder="輸入圖片說明..."
      />
    </div>
  </div>
</template>

<style scoped>
.image-card {
  background: white;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: default;
  position: relative;
}

.image-card.select-mode {
  cursor: pointer;
}

.image-card.selected {
  outline: 3px solid #667eea;
  outline-offset: 2px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.image-card:hover .drag-handle {
  opacity: 1;
}

/* 選取勾選框 */
.select-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1001;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid white;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  font-weight: 900;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.select-checkbox.checked {
  background: #667eea;
  border-color: white;
}

/* 拖拽手柄 */
.drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: grab;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  border: 2px solid white;
  pointer-events: auto;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.drag-handle:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  transform: scale(1.1);
}

.drag-handle:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.drag-icon {
  font-size: 1.3rem;
  font-weight: 900;
  color: white;
  letter-spacing: -2px;
  display: block;
  line-height: 1;
  pointer-events: none;
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
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
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.preview-icon:hover {
  transform: scale(1.1);
  background: white;
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
  margin: 0 0 0.5rem 0;
}

.caption-input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
  transition: border-color 0.2s;
  text-align: center;
}

.caption-input:focus {
  outline: none;
  border-color: #667eea;
}

.caption-input::placeholder {
  color: #bbb;
}
</style>
