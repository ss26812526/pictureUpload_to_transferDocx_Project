<script setup lang="ts">
import { ref } from 'vue';
import type { UploadedImage } from '../../types';
import { useImageSortable } from '../../composables/useImageSortable';
import ImageCard from './ImageCard.vue';
import { useI18n } from '../../i18n';

/**
 * 圖片網格組件
 * 整合 SortableJS 實現拖拽排序
 */
const props = defineProps<{
  images: UploadedImage[];
  selectMode?: boolean;
  selectedIds?: Set<string>;
}>();

const emit = defineEmits<{
  remove: [id: string];
  preview: [index: number];
  toggleSelect: [id: string];
  updateCaption: [id: string, caption: string];
}>();

const { t } = useI18n();
const imageGridRef = ref<HTMLElement | null>(null);

// 使用拖拽排序 composable
// 注意: 這裡需要使用 computed 來確保響應式
import { computed } from 'vue';
const imagesRef = computed({
  get: () => props.images,
  set: () => {
    // 由於 images 是 prop,實際的更新由父組件處理
  },
});

useImageSortable(imageGridRef, imagesRef as any);
</script>

<template>
  <div v-if="images.length > 0">
    <div class="drag-hint">{{ t('grid.dragHint') }}</div>
    <div class="image-grid" ref="imageGridRef">
      <ImageCard
        v-for="(image, index) in images"
        :key="image.id"
        :image="image"
        :index="index"
        :select-mode="selectMode"
        :selected="selectedIds?.has(image.id) ?? false"
        @remove="emit('remove', $event)"
        @preview="emit('preview', $event)"
        @toggle-select="emit('toggleSelect', $event)"
        @update-caption="(id: string, caption: string) => emit('updateCaption', id, caption)"
      />
    </div>
  </div>
</template>

<style scoped>
/* 拖拽提示 */
.drag-hint {
  text-align: center;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #fff9c4 0%, #ffe082 100%);
  border-radius: 12px;
  color: #f57c00;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid #ffb300;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

/* 圖片網格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Sortable 樣式 */
:deep(.sortable-ghost) {
  opacity: 0.3;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px dashed #667eea;
}

:deep(.sortable-ghost *) {
  opacity: 0;
}

:deep(.sortable-chosen) {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3) !important;
  z-index: 999;
}

:deep(.sortable-drag) {
  opacity: 0.9;
  transform: rotate(3deg);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.5);
}

:deep(.sortable-fallback) {
  opacity: 0.8;
  transform: scale(1.05);
}
</style>
