<script setup lang="ts">
/**
 * 通用載入遮罩組件
 * 可重用於任何需要顯示載入狀態的場景
 */
defineProps<{
  show: boolean;
  message?: string;
}>();
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ message || '處理中,請稍候...' }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
