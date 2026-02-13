<script setup lang="ts">
import type { ExportOptions } from '../../types';

/**
 * 匯出設定表單組件
 * 支援 v-model 雙向綁定
 * 包含頁面尺寸、浮水印等設定
 */
const modelValue = defineModel<ExportOptions>({ required: true });
</script>

<template>
  <div class="export-settings">
    <h3>⚙️ 匯出設定</h3>

    <!-- 圖片設定 -->
    <div class="settings-section">
      <h4>圖片設定</h4>
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

    <!-- 頁面設定 -->
    <div class="settings-section">
      <h4>頁面設定</h4>
      <div class="settings-grid">
        <div class="setting-item">
          <label>頁面尺寸:</label>
          <select v-model="modelValue.pageSize">
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">Letter (216 × 279 mm)</option>
            <option value="custom">自訂尺寸</option>
          </select>
        </div>
        <template v-if="modelValue.pageSize === 'custom'">
          <div class="setting-item">
            <label>頁面寬度 (mm):</label>
            <input
              v-model.number="modelValue.customPageWidth"
              type="number"
              min="100"
              max="500"
              step="10"
            />
          </div>
          <div class="setting-item">
            <label>頁面高度 (mm):</label>
            <input
              v-model.number="modelValue.customPageHeight"
              type="number"
              min="100"
              max="500"
              step="10"
            />
          </div>
        </template>
        <div class="setting-item">
          <label>每頁累計高度 (px):</label>
          <input
            v-model.number="modelValue.maxPageHeight"
            type="number"
            min="400"
            max="2000"
            step="100"
          />
        </div>
      </div>
    </div>

    <!-- 浮水印設定 -->
    <div class="settings-section">
      <h4>浮水印</h4>
      <div class="settings-grid">
        <div class="setting-item wide">
          <label>浮水印文字 (留空則不加):</label>
          <input
            v-model="modelValue.watermarkText"
            type="text"
            placeholder="例如: CONFIDENTIAL、公司名稱..."
            maxlength="50"
          />
        </div>
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

.settings-section {
  margin-bottom: 1.25rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  margin: 0 0 0.75rem 0;
  color: #667eea;
  font-size: 0.95rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #eee;
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

.setting-item.wide {
  grid-column: 1 / -1;
}

.setting-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.setting-item input[type='number'],
.setting-item input[type='range'],
.setting-item input[type='text'],
.setting-item select {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.setting-item input[type='number']:focus,
.setting-item input[type='range']:focus,
.setting-item input[type='text']:focus,
.setting-item select:focus {
  outline: none;
  border-color: #667eea;
}

.setting-item select {
  cursor: pointer;
  background: white;
}

.quality-value {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  text-align: center;
}

</style>
