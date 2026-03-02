# CLAUDE.md

此檔案為 Claude Code 的專案指引，幫助 AI 助手理解專案架構、慣例與開發流程。

---

## 專案概覽

**專案名稱：** image-to-docx（圖片上傳轉文件匯出工具）

**用途：** 讓使用者上傳圖片，進行智慧壓縮後，匯出為 DOCX 或 PDF 文件，支援自訂版面、浮水印與圖說。

**語言：** 繁體中文介面為主，支援英文切換（i18n）。

---

## 技術棧

| 類別 | 工具 |
|------|------|
| 框架 | Vue 3.5（Composition API、`<script setup>`） |
| 型別 | TypeScript 5.9（strict 模式） |
| 建置 | Vite 7 |
| 狀態管理 | Pinia 3 |
| 文件匯出 | docx 9（DOCX）、jsPDF 4（PDF） |
| 圖片壓縮 | Canvas API + Web Worker（OffscreenCanvas） |
| 拖拽排序 | SortableJS 1.15 |
| 測試 | Vitest 4 + @vue/test-utils 2 + happy-dom |

---

## 目錄結構

```
src/
├── components/
│   ├── ImageUploader/       # 主功能模組（容器 + 子元件）
│   │   ├── index.vue        # 容器元件，協調所有子元件
│   │   ├── UploadZone.vue   # 拖拽 / 貼上 / 點擊上傳區
│   │   ├── StatsPanel.vue   # 壓縮前後容量統計
│   │   ├── ExportSettings.vue # 匯出設定（版面、品質、浮水印）
│   │   ├── ImageGrid.vue    # SortableJS 排序網格
│   │   ├── ImageCard.vue    # 單張圖片卡片（預覽 + 圖說）
│   │   └── ActionButtons.vue # DOCX / PDF 匯出按鈕
│   └── common/              # 共用 UI 元件
│       ├── LoadingOverlay.vue
│       ├── ToastContainer.vue
│       └── ImageLightbox.vue
├── composables/             # 可重用邏輯（Composables）
│   ├── useImageUpload.ts    # 上傳 + 壓縮流程
│   ├── useImageSortable.ts  # SortableJS 封裝
│   ├── useImageExport.ts    # DOCX / PDF 匯出邏輯
│   ├── useToast.ts          # 全域通知系統
│   └── useWorkerCompress.ts # Web Worker 封裝（含 fallback）
├── stores/
│   └── imageStore.ts        # 圖片狀態、Undo/Redo、批次操作
├── workers/
│   └── imageCompressWorker.ts # OffscreenCanvas 壓縮 Worker
├── utils/
│   ├── imageCompressor.ts   # 主執行緒 Canvas 壓縮
│   ├── docxGenerator.ts     # DOCX 生成（242 行）
│   └── pdfGenerator.ts      # PDF 生成（114 行）
├── i18n/
│   ├── index.ts             # 自訂輕量 i18n composable
│   ├── zhTW.ts              # 繁體中文翻譯
│   └── en.ts                # 英文翻譯
├── types/
│   └── index.ts             # 核心型別（UploadedImage, ExportOptions, PageSize）
└── __tests__/               # Vitest 單元測試
```

---

## 核心型別

修改前務必查閱 [src/types/index.ts](src/types/index.ts)：

```typescript
interface UploadedImage {
  id: string;
  file: File;
  preview: string;           // Object URL
  compressedDataUrl: string; // Base64 壓縮後圖片
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  caption?: string;
}

interface ExportOptions {
  maxWidth: number;          // 預設 500px
  maxHeight: number;         // 預設 400px
  quality: number;           // 0.1–1.0，預設 0.92
  maxPageHeight: number;     // 分頁閾值，預設 800px
  pageSize: 'A4' | 'Letter' | 'custom';
  customPageWidth?: number;  // mm
  customPageHeight?: number; // mm
  watermarkText: string;
}
```

---

## 開發指令

```bash
npm run dev        # 啟動開發伺服器
npm run build      # 型別檢查 + 生產建置
npm run preview    # 預覽建置結果
npm run test       # Vitest 監聽模式
npm run test:run   # Vitest 單次執行
```

---

## 架構慣例

### 元件設計

- 所有元件使用 `<script setup lang="ts">`
- Props / Emits 必須明確型別定義（`defineProps<{}>()`, `defineEmits<{}>()`)
- 雙向綁定使用 `defineModel()`（如 `ExportSettings.vue`）
- 資料流：Props ↓ Events ↑（單向資料流）
- 業務邏輯抽取至 composables，元件只處理 UI

### 狀態管理

- 跨元件共享狀態放在 `imageStore.ts`（Pinia）
- 本地 UI 狀態（如 hover、loading）保留在元件內
- Undo/Redo 快照在每次圖片操作前儲存

### 圖片壓縮

- 優先使用 Web Worker（`useWorkerCompress.ts`）
- Worker 不可用時自動退回主執行緒（`imageCompressor.ts`）
- 壓縮後若檔案變大，保留原始檔案

### 匯出邏輯

- DOCX：使用 `docxGenerator.ts`，支援分頁、浮水印、圖說
- PDF：使用 `pdfGenerator.ts`，圖片嵌入使用 `'FAST'` 壓縮模式
- 匯出邏輯封裝於 `useImageExport.ts`

### 通知系統

- 使用 `useToast()` composable
- 類型：`success` / `error` / `warning` / `info`
- 自動消失（3 秒；error 為 4 秒）

### i18n

- 使用自訂輕量 composable（`src/i18n/index.ts`），不引入外部 i18n 函式庫
- 語言偏好儲存於 `localStorage`
- 新增翻譯鍵值時，同步更新 `zhTW.ts` 與 `en.ts`

---

## 撰寫程式碼的注意事項

1. **嚴格 TypeScript**：不使用 `any`，善用型別推斷與介面
2. **記憶體管理**：刪除圖片時呼叫 `URL.revokeObjectURL()`；元件 unmount 時清理 Worker 和事件監聽
3. **避免過度設計**：只做需要的事，不加多餘的抽象層
4. **錯誤處理**：async 操作加 try-catch，用 Toast 通知使用者
5. **不跳過 lint / 型別檢查**：不使用 `// @ts-ignore`，若有型別問題要修正根本原因
6. **不自動 push**：除非明確要求，否則不 push 到遠端

---

## 測試規範

- 測試檔案放在 `src/__tests__/`，命名為 `*.test.ts`
- 使用 Vitest + @vue/test-utils
- 測試環境：happy-dom
- 新增 utility 函式或 composable 時，建議補充對應測試

---

## 元件層級

```
App.vue
└── ImageUploader/index.vue   ← 主容器（協調所有子元件 + Pinia）
    ├── UploadZone.vue
    ├── StatsPanel.vue
    ├── ExportSettings.vue
    ├── ImageGrid.vue
    │   └── ImageCard.vue
    └── ActionButtons.vue
ImageLightbox.vue             ← Teleport 到 body
LoadingOverlay.vue            ← 全域遮罩
ToastContainer.vue            ← Teleport 到 body
```

---

## 常見任務對應位置

| 任務 | 對應檔案 |
|------|----------|
| 新增上傳方式 | `UploadZone.vue` + `useImageUpload.ts` |
| 調整壓縮邏輯 | `imageCompressor.ts` / `imageCompressWorker.ts` |
| 新增匯出格式 | `utils/` 新增 generator + `useImageExport.ts` |
| 修改版面設定 | `ExportSettings.vue` + `types/index.ts` |
| 新增翻譯文字 | `i18n/zhTW.ts` + `i18n/en.ts` |
| 修改全域狀態 | `stores/imageStore.ts` |
| 新增通知 | 任何地方呼叫 `useToast()` |
