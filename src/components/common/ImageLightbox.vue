<script setup lang="ts">
/**
 * 圖片 Lightbox 元件
 * 點擊圖片放大預覽，支援鍵盤左右切換和 ESC 關閉
 */
defineProps<{
  src: string;
  alt?: string;
  currentIndex?: number;
  total?: number;
}>();

const emit = defineEmits<{
  close: [];
  prev: [];
  next: [];
}>();

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
  if (e.key === 'ArrowLeft') emit('prev');
  if (e.key === 'ArrowRight') emit('next');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="src"
        class="lightbox-overlay"
        @click.self="emit('close')"
        @keydown="handleKeydown"
        tabindex="0"
        ref="overlayRef"
      >
        <!-- 關閉按鈕 -->
        <button class="lightbox-close" @click="emit('close')" title="關閉 (ESC)">✕</button>

        <!-- 上一張 -->
        <button
          v-if="total && total > 1"
          class="lightbox-nav lightbox-prev"
          @click.stop="emit('prev')"
          title="上一張 (←)"
        >
          ‹
        </button>

        <!-- 圖片 -->
        <div class="lightbox-content" @click.stop>
          <img :src="src" :alt="alt || '預覽圖片'" class="lightbox-image" />
          <div v-if="total && total > 1" class="lightbox-counter">
            {{ (currentIndex ?? 0) + 1 }} / {{ total }}
          </div>
        </div>

        <!-- 下一張 -->
        <button
          v-if="total && total > 1"
          class="lightbox-nav lightbox-next"
          @click.stop="emit('next')"
          title="下一張 (→)"
        >
          ›
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  outline: none;
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 1.8rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 3rem;
  width: 56px;
  height: 80px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: 1.5rem;
}

.lightbox-next {
  right: 1.5rem;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lightbox-counter {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

/* 動畫 */
.lightbox-enter-active {
  transition: opacity 0.25s ease;
}

.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-image {
  animation: lightbox-zoom-in 0.25s ease;
}

@keyframes lightbox-zoom-in {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .lightbox-nav {
    width: 40px;
    height: 60px;
    font-size: 2rem;
  }

  .lightbox-prev {
    left: 0.5rem;
  }

  .lightbox-next {
    right: 0.5rem;
  }
}
</style>
