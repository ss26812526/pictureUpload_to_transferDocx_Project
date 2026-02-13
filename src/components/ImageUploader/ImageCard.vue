<script setup lang="ts">
import type { UploadedImage } from '../../types';
import { formatFileSize } from '../../utils/imageCompressor';

/**
 * 單張圖片卡片組件
 * 顯示圖片預覽、編號、大小資訊和刪除按鈕
 */
defineProps<{
  image: UploadedImage;
  index: number;
}>();

const emit = defineEmits<{
  remove: [id: string];
}>();
</script>

<template>
  <div class="image-card">
    <div class="drag-handle" title="拖拽以調整順序">
      <span class="drag-icon">⋮⋮</span>
    </div>
    <div class="image-wrapper">
      <img :src="image.preview" :alt="`Image ${index + 1}`" />
      <div class="image-overlay">
        <button class="remove-btn" @click.stop="emit('remove', image.id)" title="刪除">❌</button>
      </div>
    </div>
    <div class="image-info">
      <p class="image-number">Figure {{ index + 1 }}</p>
      <p class="image-size">
        {{ formatFileSize(image.originalSize) }} → {{ formatFileSize(image.compressedSize) }}
      </p>
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

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.image-card:hover .drag-handle {
  opacity: 1;
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
</style>
