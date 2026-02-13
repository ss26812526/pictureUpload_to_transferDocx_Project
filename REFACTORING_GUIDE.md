# Vue 3 重構最佳實踐指南

> 本文檔基於實際專案重構經驗,提供可操作的重構指南供未來開發參考

---

## 📋 目錄

1. [何時需要重構?](#1-何時需要重構)
2. [Vue 3 組件拆分原則](#2-vue-3-組件拆分原則)
3. [Composables 設計模式](#3-composables-設計模式)
4. [目錄結構最佳實踐](#4-目錄結構最佳實踐)
5. [重構流程 SOP](#5-重構流程-sop)
6. [常見陷阱與解決方案](#6-常見陷阱與解決方案)
7. [實際案例分析](#7-實際案例分析)

---

## 1. 何時需要重構?

### 🚨 需要重構的徵兆

#### 檔案行數判斷標準
- ⚠️ **警戒線**: 單一組件超過 **300-400 行**
- 🚨 **必須重構**: 單一組件超過 **500 行**
- 📊 **本專案案例**: 原始 ImageUploader.vue 有 **823 行**

#### 職責過多的徵兆
問自己以下問題:

```
✅ 這個組件是否同時負責:
   □ UI 渲染
   □ 業務邏輯
   □ 狀態管理
   □ API 呼叫
   □ 資料處理
   □ 事件處理

如果勾選 3 個以上 → 需要重構
```

#### 重複代碼的識別
- 相同邏輯在多個地方出現 (DRY 原則)
- 複製貼上的程式碼區塊
- 相似的狀態管理模式

### ✅ 何時可以不重構?

- 單一檔案 < 200 行
- 簡單的 CRUD 頁面
- 一次性的 Prototype
- 個人小工具且不打算維護
- 沒有團隊協作需求

---

## 2. Vue 3 組件拆分原則

### 🎯 單一職責原則 (Single Responsibility Principle)

**每個組件只做一件事,並且做好**

#### ❌ 錯誤範例
```vue
<!-- UserDashboard.vue - 做太多事了! -->
<template>
  <!-- 顯示用戶資訊 -->
  <!-- 顯示訂單列表 -->
  <!-- 顯示統計圖表 -->
  <!-- 顯示通知 -->
  <!-- 表單驗證 -->
</template>
```

#### ✅ 正確範例
```vue
<!-- UserDashboard.vue - 只負責組合 -->
<template>
  <UserProfile :user="user" />
  <OrderList :orders="orders" />
  <StatsChart :data="stats" />
  <NotificationPanel :notifications="notifications" />
</template>
```

### 🔄 Props Down, Events Up

**資料流必須是單向的**

```vue
<!-- Parent.vue -->
<template>
  <ChildComponent
    :data="parentData"           <!-- Props 向下傳遞 -->
    @update="handleUpdate"       <!-- Events 向上發射 -->
  />
</template>

<!-- ChildComponent.vue -->
<script setup>
defineProps<{ data: SomeType }>();
const emit = defineEmits<{ update: [value: string] }>();

function onChange(value: string) {
  emit('update', value);  // 不直接修改 props
}
</script>
```

### 🧩 何時使用 Composables vs Components

| 場景 | 使用 Composables | 使用 Components |
|-----|-----------------|-----------------|
| **純邏輯** (無 UI) | ✅ | ❌ |
| **可重用的狀態管理** | ✅ | ❌ |
| **API 呼叫** | ✅ | ❌ |
| **UI 展示** | ❌ | ✅ |
| **需要插槽 (slots)** | ❌ | ✅ |
| **需要樣式** | ❌ | ✅ |

#### 實際案例

```typescript
// ✅ Composable - 純邏輯
export function useImageUpload() {
  const images = ref([]);
  async function processFiles(files) { /* ... */ }
  return { images, processFiles };
}

// ✅ Component - 有 UI
<template>
  <div class="upload-zone">
    <input type="file" @change="handleUpload" />
  </div>
</template>
```

---

## 3. Composables 設計模式

### 📝 命名規範

**一律使用 `use*` 開頭**

```typescript
✅ useImageUpload.ts
✅ useAuth.ts
✅ useFetch.ts
✅ useLocalStorage.ts

❌ imageUpload.ts
❌ auth.ts
❌ fetchUtils.ts
```

### 🎯 何時使用 Composables?

#### ✅ 應該使用 Composables:

1. **狀態邏輯** - 需要在多個組件間共享
   ```typescript
   export function useCounter() {
     const count = ref(0);
     const increment = () => count.value++;
     return { count, increment };
   }
   ```

2. **副作用邏輯** - API 呼叫、WebSocket 連接
   ```typescript
   export function useFetch(url) {
     const data = ref(null);
     const error = ref(null);

     async function fetchData() {
       try {
         data.value = await fetch(url).then(r => r.json());
       } catch (e) {
         error.value = e;
       }
     }

     return { data, error, fetchData };
   }
   ```

3. **生命週期管理** - 需要 onMounted/onUnmounted
   ```typescript
   export function useEventListener(target, event, handler) {
     onMounted(() => target.addEventListener(event, handler));
     onUnmounted(() => target.removeEventListener(event, handler));
   }
   ```

#### ❌ 不應該使用 Composables:

1. **純工具函數** - 沒有狀態或生命週期
   ```typescript
   // ❌ 不需要 composable
   export function useFormatDate(date) {
     return new Date(date).toLocaleDateString();
   }

   // ✅ 直接用普通函數
   export function formatDate(date) {
     return new Date(date).toLocaleDateString();
   }
   ```

2. **只有常數** - 沒有響應式需求
   ```typescript
   // ❌ 過度設計
   export function useConstants() {
     return { API_URL: 'https://...' };
   }

   // ✅ 直接 export
   export const API_URL = 'https://...';
   ```

### 🏗️ Composable 結構範本

```typescript
import { ref, onMounted, onUnmounted } from 'vue';

/**
 * [功能描述]
 * @param [參數說明]
 * @returns [返回值說明]
 */
export function useSomething(config?: SomeConfig) {
  // 1. 響應式狀態
  const state = ref<SomeType>({});
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // 2. 內部函數 (可選)
  function internalHelper() {
    // ...
  }

  // 3. 公開的方法
  async function doSomething() {
    isLoading.value = true;
    try {
      // 業務邏輯
    } catch (e) {
      error.value = e as Error;
    } finally {
      isLoading.value = false;
    }
  }

  // 4. 生命週期 (如需要)
  onMounted(() => {
    // 初始化
  });

  onUnmounted(() => {
    // 清理
  });

  // 5. 返回公開的 API
  return {
    state,
    isLoading,
    error,
    doSomething,
  };
}
```

---

## 4. 目錄結構最佳實踐

### 📁 按功能模組組織 vs 按類型組織

#### ❌ 按類型組織 (不推薦大型專案)
```
src/
├── components/
│   ├── UserCard.vue
│   ├── ProductCard.vue
│   └── OrderCard.vue
├── composables/
│   ├── useUser.ts
│   ├── useProduct.ts
│   └── useOrder.ts
└── types/
    ├── user.ts
    ├── product.ts
    └── order.ts
```
**缺點**: 修改一個功能需要跨多個資料夾

#### ✅ 按功能模組組織 (推薦)
```
src/
├── features/
│   ├── user/
│   │   ├── components/
│   │   │   └── UserCard.vue
│   │   ├── composables/
│   │   │   └── useUser.ts
│   │   └── types.ts
│   ├── product/
│   │   ├── components/
│   │   │   └── ProductCard.vue
│   │   ├── composables/
│   │   │   └── useProduct.ts
│   │   └── types.ts
│   └── order/
│       ├── components/
│       ├── composables/
│       └── types.ts
└── shared/  # 共用的東西
    ├── components/
    ├── composables/
    └── utils/
```
**優點**: 所有相關檔案都在同一個資料夾

### 🎯 本專案採用的混合模式

```
src/
├── components/
│   ├── ImageUploader/      # 功能模組化
│   │   ├── index.vue
│   │   ├── UploadZone.vue
│   │   ├── StatsPanel.vue
│   │   ├── ExportSettings.vue
│   │   ├── ImageGrid.vue
│   │   ├── ImageCard.vue
│   │   └── ActionButtons.vue
│   └── common/             # 共用組件
│       └── LoadingOverlay.vue
├── composables/            # 共用邏輯
│   ├── useImageUpload.ts
│   ├── useImageSortable.ts
│   └── useImageExport.ts
├── utils/                  # 純工具函數
│   ├── imageCompressor.ts
│   └── docxGenerator.ts
└── types/                  # 共用類型
    └── index.ts
```

**為什麼這樣設計?**
- 專案規模中小型,不需要完全按功能切
- 所有 composables 都與圖片處理相關,集中管理更清晰
- common 資料夾存放可在其他專案重用的組件

### 📏 何時建立子目錄?

| 檔案數量 | 建議 |
|---------|------|
| 1-3 個 | 直接放在根目錄 |
| 4-8 個 | 考慮建立子目錄 |
| 9+ 個 | 必須建立子目錄分類 |

### 🏷️ 檔案命名規範

```
✅ PascalCase - Vue 組件
   UserCard.vue
   ProductList.vue

✅ camelCase - Composables, Utils, Types
   useAuth.ts
   formatDate.ts
   user.types.ts

✅ kebab-case - CSS, 配置檔
   main.css
   vite.config.ts
```

---

## 5. 重構流程 SOP

### 🔄 重構步驟 (按順序執行)

#### Step 1: 先邏輯後 UI

**為什麼先抽邏輯?**
- 邏輯比 UI 更容易測試
- 邏輯改動不影響視覺
- 可以漸進式遷移

```typescript
// 1️⃣ 先建立 composable
// src/composables/useImageUpload.ts
export function useImageUpload() {
  const images = ref([]);
  async function processFiles(files) { /* ... */ }
  return { images, processFiles };
}

// 2️⃣ 在原組件中使用 composable (測試)
// src/components/ImageUploader.vue
const { images, processFiles } = useImageUpload();

// 3️⃣ 確認功能正常後,再拆分 UI
```

#### Step 2: 由內而外拆分

**拆分順序**: 葉子節點 → 中間節點 → 根節點

```
ImageUploader (root)
├── UploadZone
├── StatsPanel
├── ExportSettings
├── ImageGrid
│   └── ImageCard  ← 1️⃣ 先拆這個 (最內層)
└── ActionButtons

執行順序:
1. ImageCard (無依賴)
2. ImageGrid (依賴 ImageCard)
3. UploadZone, StatsPanel, ExportSettings, ActionButtons (平行)
4. ImageUploader (root,整合所有)
```

#### Step 3: 測試驅動重構

**每完成一個組件,立即測試**

```bash
# 建立 ImageCard.vue
npm run dev  # 啟動開發伺服器
# 手動測試功能

# 建立 ImageGrid.vue
npm run dev
# 測試拖拽功能

# ... 重複
```

### ✅ 重構檢查清單

```markdown
重構前:
□ 是否已閱讀完整的原始碼?
□ 是否理解每個功能的業務邏輯?
□ 是否確認有哪些依賴套件?
□ 是否確認現有的測試案例?

重構中:
□ 是否每次只改動一個小範圍?
□ 是否每次改動後都測試功能?
□ 是否保持 Git commit 頻繁且清晰?
□ 是否遇到問題立即記錄?

重構後:
□ 所有功能是否正常運作?
□ 是否執行完整的回歸測試?
□ 是否更新相關文檔 (README)?
□ 是否清理不必要的程式碼和註解?
□ 是否更新 TypeScript 類型定義?
```

---

## 6. 常見陷阱與解決方案

### ⚠️ 陷阱 1: 過度抽象

#### ❌ 錯誤範例
```typescript
// 為了一個簡單的計數器建立複雜的抽象
export function useGenericStateManager<T>(
  initialState: T,
  options?: StateManagerOptions<T>
) {
  // 100 行複雜的程式碼...
}

// 使用時:
const counter = useGenericStateManager(0, { /* 一堆配置 */ });
```

#### ✅ 正確範例
```typescript
// 簡單問題用簡單解決方案
export function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => count.value++;
  const decrement = () => count.value--;
  return { count, increment, decrement };
}
```

**原則**: **You Aren't Gonna Need It (YAGNI)**
- 只在真的需要時才抽象
- 三次重複再抽象 (Rule of Three)
- 保持簡單

### ⚠️ 陷阱 2: 組件間通訊複雜化

#### ❌ 錯誤範例: 過度使用 Props 傳遞
```vue
<!-- 5 層深的 Props 傳遞 -->
<GrandParent>
  <Parent :user="user">
    <Child :user="user">
      <GrandChild :user="user">
        <GreatGrandChild :user="user" />  <!-- 😱 -->
      </GrandChild>
    </Child>
  </Parent>
</GrandParent>
```

#### ✅ 正確範例: 使用 Provide/Inject
```vue
<!-- GrandParent.vue -->
<script setup>
import { provide } from 'vue';
const user = ref({ name: 'Jack' });
provide('user', user);  // 提供一次
</script>

<!-- GreatGrandChild.vue -->
<script setup>
import { inject } from 'vue';
const user = inject('user');  // 直接注入
</script>
```

### ⚠️ 陷阱 3: 狀態管理混亂

#### ❌ 錯誤範例: 狀態散落各處
```typescript
// ComponentA.vue
const images = ref([]);

// ComponentB.vue
const images = ref([]);  // 😱 重複定義

// ComponentC.vue
const images = ref([]);  // 😱 又一個重複
```

#### ✅ 正確範例: 集中管理
```typescript
// composables/useImageStore.ts
const images = ref([]);  // 單一數據源

export function useImageStore() {
  return { images };
}

// 所有組件都用同一個來源
const { images } = useImageStore();
```

### ⚠️ 陷阱 4: 忽略效能優化

#### ❌ 錯誤範例: 不必要的響應式
```typescript
// 每次都重新計算,即使 images 沒變
function getTotalSize() {
  return images.value.reduce((sum, img) => sum + img.size, 0);
}
```

#### ✅ 正確範例: 使用 computed
```typescript
const totalSize = computed(() => {
  return images.value.reduce((sum, img) => sum + img.size, 0);
});
// 只有 images 改變時才重新計算
```

---

## 7. 實際案例分析

### 📊 本專案重構成果

#### Before (重構前)
```
src/components/ImageUploader.vue  [823 行]
├── 所有 UI
├── 所有邏輯
├── 所有狀態
└── 所有樣式
```

#### After (重構後)
```
src/
├── components/
│   ├── ImageUploader/
│   │   ├── index.vue           [120 行] ⬇️ 85% 減少
│   │   ├── UploadZone.vue      [100 行]
│   │   ├── StatsPanel.vue      [80 行]
│   │   ├── ExportSettings.vue  [120 行]
│   │   ├── ImageGrid.vue       [100 行]
│   │   ├── ImageCard.vue       [150 行]
│   │   └── ActionButtons.vue   [60 行]
│   └── common/
│       └── LoadingOverlay.vue  [50 行]
├── composables/
│   ├── useImageUpload.ts       [110 行]
│   ├── useImageSortable.ts     [70 行]
│   └── useImageExport.ts       [40 行]
└── ...
```

### 📈 量化改善指標

| 指標 | 重構前 | 重構後 | 改善 |
|-----|-------|--------|------|
| **最大單檔行數** | 823 | 150 | ⬇️ 82% |
| **組件職責** | 8 個 | 1 個 | ⬇️ 87% |
| **可重用組件** | 0 個 | 8 個 | ⬆️ ∞ |
| **邏輯抽取** | 0% | 100% | ⬆️ 100% |
| **測試便利性** | 低 | 高 | ⬆️ 顯著 |

### 🎯 重構帶來的實際好處

#### 1. 可維護性提升
```
修改拖拽邏輯:
重構前: 在 823 行中尋找 → 花費 10 分鐘
重構後: 直接看 useImageSortable.ts → 花費 1 分鐘
⏱️ 節省 90% 時間
```

#### 2. 可重用性提升
```typescript
// LoadingOverlay.vue 可以在任何專案使用
import LoadingOverlay from '@/components/common/LoadingOverlay.vue';

// useImageUpload 可以在其他組件使用
const { processFiles } = useImageUpload();
```

#### 3. 測試覆蓋率提升
```typescript
// 重構前: 無法單獨測試邏輯
// 重構後: 每個 composable 都能獨立測試

import { useImageUpload } from '@/composables/useImageUpload';

describe('useImageUpload', () => {
  it('should process files correctly', async () => {
    const { processFiles, images } = useImageUpload();
    await processFiles([mockFile]);
    expect(images.value).toHaveLength(1);
  });
});
```

#### 4. 團隊協作改善
```
情境: A 和 B 同時修改功能

重構前:
- A 修改上傳邏輯 (ImageUploader.vue 第 100-200 行)
- B 修改樣式 (ImageUploader.vue 第 500-600 行)
- Git 衝突! 😱 需要手動合併

重構後:
- A 修改 useImageUpload.ts
- B 修改 UploadZone.vue 的 <style>
- 完全沒有衝突! ✅ 自動合併
```

---

## 🎓 總結: 重構黃金法則

### ✅ Do's (應該做的)

1. **小步前進** - 每次只改一點,頻繁測試
2. **先理解再重構** - 完全理解現有代碼
3. **保持功能不變** - 重構是改善結構,不是新增功能
4. **頻繁提交** - Git commit 要小而清晰
5. **寫文檔** - 記錄重構原因和決策

### ❌ Don'ts (不應該做的)

1. **不要邊重構邊新增功能** - 一次只做一件事
2. **不要過度設計** - YAGNI 原則
3. **不要跳過測試** - 每個改動都要驗證
4. **不要一次大改** - 增量式重構
5. **不要忽略團隊意見** - Code Review 很重要

---

## 📚 延伸閱讀

### 官方文檔
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 Style Guide](https://vuejs.org/style-guide/)

### 設計原則
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring](https://martinfowler.com/books/refactoring.html)

### Vue 3 最佳實踐
- [VueUse](https://vueuse.org/) - Composables 範例
- [Anthony Fu's Blog](https://antfu.me/) - Vue 核心成員的見解

---

## 📝 授權與貢獻

本文檔基於實際專案經驗撰寫,歡迎:
- ⭐ Star 收藏
- 🍴 Fork 修改
- 💬 提出建議
- 🔗 分享給其他開發者

**最後更新**: 2026-02-13
**作者**: Jack
**專案**: Image to DOCX Converter

---

*"Code is read much more often than it is written." - Guido van Rossum*

*"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler*
