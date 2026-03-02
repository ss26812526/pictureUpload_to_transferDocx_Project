<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useToast } from '../../composables/useToast';
import { useI18n } from '../../i18n';

/**
 * 上傳區域組件
 * 支援點擊上傳、拖拽上傳和剪貼簿貼上 (Ctrl+V)
 */
const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  upload: [files: File[]];
}>();

const toast = useToast();
const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// 處理檔案選擇
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('upload', Array.from(target.files));
    target.value = ''; // 重置 input
  }
}

// 處理拖拽
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  isDragging.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
    isDragging.value = false;
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    emit('upload', Array.from(event.dataTransfer.files));
  }
}

function triggerFileInput() {
  if (!props.disabled) {
    fileInputRef.value?.click();
  }
}

// 處理剪貼簿貼上 (Ctrl+V)
function handlePaste(event: ClipboardEvent) {
  if (props.disabled) return;

  const items = event.clipboardData?.items;
  if (!items) return;

  const imageFiles: File[] = [];
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) imageFiles.push(file);
    }
  }

  if (imageFiles.length > 0) {
    event.preventDefault();
    emit('upload', imageFiles);
    toast.success(t('upload.pastedCount').replace('{count}', String(imageFiles.length)));
  }
}

onMounted(() => {
  document.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste);
});
</script>

<template>
  <div
    class="upload-zone"
    :class="{ dragging: isDragging, disabled: disabled }"
    @dragenter.prevent="isDragging = true"
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
      :disabled="disabled"
    />
    <div class="upload-content">
      <div class="upload-icon">📁</div>
      <p class="upload-text">{{ t('upload.dropzone') }}</p>
      <p class="upload-hint">{{ t('upload.hint') }}</p>
    </div>
  </div>
</template>

<style scoped>
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

.upload-zone:hover:not(.disabled) {
  border-color: #667eea;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  transform: translateY(-2px);
}

.upload-zone.dragging {
  border-color: #667eea;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  transform: scale(1.02);
}

.upload-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
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
</style>
