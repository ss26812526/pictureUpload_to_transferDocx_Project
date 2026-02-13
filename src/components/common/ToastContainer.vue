<script setup lang="ts">
import { useToast } from '../../composables/useToast';

/**
 * Toast 通知容器
 * 放在 App.vue 中，全域顯示通知訊息
 */
const { toasts, removeToast } = useToast();

const typeIcons: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
          @click="removeToast(toast.id)"
        >
          <span class="toast-icon">{{ typeIcons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  min-width: 280px;
  max-width: 420px;
}

.toast-success {
  background: linear-gradient(135deg, #43a047, #66bb6a);
}

.toast-error {
  background: linear-gradient(135deg, #e53935, #ef5350);
}

.toast-warning {
  background: linear-gradient(135deg, #f57c00, #ffa726);
}

.toast-info {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

/* 動畫 */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.06, 0.71, 0.55, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 480px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast-item {
    min-width: unset;
    max-width: unset;
  }
}
</style>
