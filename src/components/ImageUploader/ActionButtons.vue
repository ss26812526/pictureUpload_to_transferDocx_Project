<script setup lang="ts">
/**
 * 操作按鈕組件
 * 提供清空和匯出功能
 */
defineProps<{
  disabled?: boolean;
  imageCount: number;
}>();

const emit = defineEmits<{
  clear: [];
  export: [];
}>();
</script>

<template>
  <div v-if="imageCount > 0" class="actions">
    <button class="btn btn-secondary" @click="emit('clear')" :disabled="disabled">
      🗑️ 清空所有圖片
    </button>
    <button class="btn btn-primary" @click="emit('export')" :disabled="disabled">
      <span v-if="disabled">⏳ 處理中...</span>
      <span v-else>📥 匯出 DOCX</span>
    </button>
  </div>
</template>

<style scoped>
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
</style>
