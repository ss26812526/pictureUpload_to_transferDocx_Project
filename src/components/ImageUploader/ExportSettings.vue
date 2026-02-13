<script setup lang="ts">
import type { ExportOptions } from '../../types';

/**
 * 匯出設定表單組件
 * 支援 v-model 雙向綁定
 */
const modelValue = defineModel<ExportOptions>({ required: true });
</script>

<template>
  <div class="export-settings">
    <h3>⚙️ 匯出設定</h3>
    <div class="settings-grid">
      <div class="setting-item">
        <label>圖片最大寬度 (px):</label>
        <input
          v-model.number="modelValue.maxWidth"
          type="number"
          min="100"
          max="800"
          step="50"
        />
      </div>
      <div class="setting-item">
        <label>圖片最大高度 (px):</label>
        <input
          v-model.number="modelValue.maxHeight"
          type="number"
          min="100"
          max="800"
          step="50"
        />
      </div>
      <div class="setting-item">
        <label>每頁累計高度 (px):</label>
        <input
          v-model.number="modelValue.maxPageHeight"
          type="number"
          min="400"
          max="2000"
          step="100"
        />
        <span class="hint-text">🤖 智能分頁</span>
      </div>
      <div class="setting-item">
        <label>壓縮品質:</label>
        <input
          v-model.number="modelValue.quality"
          type="range"
          min="0.5"
          max="1"
          step="0.05"
        />
        <span class="quality-value">{{ Math.round(modelValue.quality * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-settings {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.export-settings h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.setting-item input[type='number'],
.setting-item input[type='range'] {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.setting-item input[type='number']:focus,
.setting-item input[type='range']:focus {
  outline: none;
  border-color: #667eea;
}

.quality-value {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  text-align: center;
}

.hint-text {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
  text-align: center;
  margin-top: 0.25rem;
}
</style>
