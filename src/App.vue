<script setup lang="ts">
import ImageUploader from './components/ImageUploader/index.vue'
</script>

<template>
  <div class="app">
    <ImageUploader />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .app {
    padding: 1rem 0.5rem;
  }
}
</style>
