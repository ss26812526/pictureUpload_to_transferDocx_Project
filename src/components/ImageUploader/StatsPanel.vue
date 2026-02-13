<script setup lang="ts">
import type { UploadedImage } from '../../types';
import { formatFileSize } from '../../utils/imageCompressor';

/**
 * 統計資訊面板組件
 * 顯示圖片數量、原始大小、壓縮後大小、節省比例
 */
const props = defineProps<{
  images: UploadedImage[];
}>();

// 計算總檔案大小
function getTotalSize() {
  const original = props.images.reduce((sum, img) => sum + img.originalSize, 0);
  const compressed = props.images.reduce((sum, img) => sum + img.compressedSize, 0);
  return { original, compressed };
}
</script>

<template>
  <div v-if="images.length > 0" class="stats">
    <div class="stat-item">
      <span class="stat-label">已上傳圖片:</span>
      <span class="stat-value">{{ images.length }} 張</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">原始大小:</span>
      <span class="stat-value">{{ formatFileSize(getTotalSize().original) }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">壓縮後:</span>
      <span class="stat-value compressed">{{ formatFileSize(getTotalSize().compressed) }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">節省:</span>
      <span class="stat-value savings">
        {{ Math.round((1 - getTotalSize().compressed / getTotalSize().original) * 100) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
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
</style>
