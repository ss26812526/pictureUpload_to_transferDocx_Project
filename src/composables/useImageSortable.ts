import { ref, watch, nextTick, onUnmounted, type Ref } from 'vue';
import Sortable from 'sortablejs';
import type { UploadedImage } from '../types';

/**
 * SortableJS 拖拽排序的組合式函數
 * 負責初始化、銷毀、監聽圖片陣列變化
 */
export function useImageSortable(
  containerRef: Ref<HTMLElement | null>,
  images: Ref<UploadedImage[]>
) {
  const sortableInstance = ref<Sortable | null>(null);

  /**
   * 初始化 SortableJS
   */
  function initSortable(): void {
    // 銷毀舊實例
    if (sortableInstance.value) {
      sortableInstance.value.destroy();
      sortableInstance.value = null;
    }

    // 建立新實例
    if (containerRef.value) {
      sortableInstance.value = Sortable.create(containerRef.value, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.drag-handle', // 只能透過拖拽手柄拖動
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
  }

  /**
   * 銷毀 SortableJS 實例
   */
  function destroySortable(): void {
    if (sortableInstance.value) {
      sortableInstance.value.destroy();
      sortableInstance.value = null;
    }
  }

  // 監聽圖片數組變化,重新初始化拖拽
  watch(
    images,
    async (newImages) => {
      if (newImages.length > 0) {
        await nextTick();
        initSortable();
      }
    },
    { deep: true }
  );

  // 組件卸載時清理
  onUnmounted(() => {
    destroySortable();
  });

  return {
    sortableInstance,
    initSortable,
    destroySortable,
  };
}
