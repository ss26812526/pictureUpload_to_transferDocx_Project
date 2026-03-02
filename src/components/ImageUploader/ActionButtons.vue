<script setup lang="ts">
import { useI18n } from '../../i18n';

/**
 * 操作按鈕組件
 * 提供清空、匯出 DOCX 和匯出 PDF 功能
 */
defineProps<{
  disabled?: boolean;
  imageCount: number;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  clear: [];
  export: [];
  exportPdf: [];
}>();
</script>

<template>
  <div v-if="imageCount > 0" class="actions">
    <button class="btn btn-secondary" @click="emit('clear')" :disabled="disabled">
      {{ t('actions.clearAll') }}
    </button>
    <button class="btn btn-primary" @click="emit('export')" :disabled="disabled">
      <span v-if="disabled">{{ t('actions.processing') }}</span>
      <span v-else>{{ t('actions.exportDocx') }}</span>
    </button>
    <button class="btn btn-pdf" @click="emit('exportPdf')" :disabled="disabled">
      <span v-if="disabled">{{ t('actions.processing') }}</span>
      <span v-else>{{ t('actions.exportPdf') }}</span>
    </button>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

.btn-pdf {
  background: linear-gradient(135deg, #e53935 0%, #ff7043 100%);
  color: white;
}

.btn-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(229, 57, 53, 0.4);
}
</style>
