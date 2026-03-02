# Image to Document Converter

## English

### Features

**Upload & Management**
- Multi-image upload with drag-and-drop support
- Clipboard paste upload (Ctrl+V)
- Drag-and-drop image reordering using SortableJS
- Batch select and batch delete
- Undo / Redo for all image operations
- Per-image caption / description input

**Image Processing**
- Automatic image compression with adjustable quality
- Web Worker compression (OffscreenCanvas) to avoid blocking UI
- Automatic fallback to main-thread compression when Worker is unavailable
- Real-time statistics showing original and compressed file sizes

**Export**
- Export to **DOCX** format (Word document)
- Export to **PDF** format
- Customizable page size: A4, Letter, or custom dimensions
- Watermark text support
- Smart pagination based on cumulative image height
- Auto-numbered figures with optional captions

**UX**
- Image preview Lightbox with keyboard navigation (ESC / Arrow keys)
- Toast notification system (replaces native alert)
- Internationalization (i18n): Traditional Chinese & English
- Responsive layout

### Tech Stack
- **Vue 3 + TypeScript** - Modern reactive framework with type safety
- **Vite** - Lightning-fast build tool
- **Pinia** - Centralized state management
- **Composition API** - Reusable logic with composables
- **Web Worker** - Off-main-thread image compression
- **docx** - DOCX file generation
- **jsPDF** - PDF file generation
- **SortableJS** - Drag-and-drop functionality
- **FileSaver.js** - Client-side file saving
- **Vitest** - Unit testing framework

### Project Architecture

```
src/
├── components/
│   ├── ImageUploader/         # Main feature module
│   │   ├── index.vue           # Container component (Pinia + i18n)
│   │   ├── UploadZone.vue      # Upload area (drag & drop + paste)
│   │   ├── StatsPanel.vue      # Statistics display
│   │   ├── ExportSettings.vue  # Settings form (page size, watermark)
│   │   ├── ImageGrid.vue       # Image grid container
│   │   ├── ImageCard.vue       # Individual image card (select, caption)
│   │   └── ActionButtons.vue   # Action buttons (DOCX, PDF)
│   └── common/
│       ├── LoadingOverlay.vue  # Reusable loading overlay
│       ├── ToastContainer.vue  # Toast notifications
│       └── ImageLightbox.vue   # Fullscreen image preview
├── composables/
│   ├── useImageUpload.ts       # Upload & compression logic
│   ├── useImageSortable.ts     # Sortable integration
│   ├── useImageExport.ts       # DOCX & PDF export logic
│   ├── useToast.ts             # Global toast notification
│   └── useWorkerCompress.ts    # Web Worker compression wrapper
├── stores/
│   └── imageStore.ts           # Pinia store (state, undo/redo, batch)
├── workers/
│   └── imageCompressWorker.ts  # Web Worker for image compression
├── i18n/
│   ├── index.ts                # i18n composable
│   ├── zhTW.ts                 # Traditional Chinese translations
│   └── en.ts                   # English translations
├── utils/
│   ├── imageCompressor.ts      # Image compression utilities
│   ├── docxGenerator.ts        # DOCX generation utilities
│   └── pdfGenerator.ts         # PDF generation utilities
├── __tests__/                  # Unit tests (Vitest)
│   ├── imageCompressor.test.ts
│   ├── docxGenerator.test.ts
│   ├── useToast.test.ts
│   └── i18n.test.ts
└── types/
    └── index.ts                # TypeScript type definitions
```

**Design Principles:**
- Single Responsibility - Each component has one clear purpose
- Composables for Logic - Reusable business logic extracted from components
- Props Down, Events Up - Clear data flow pattern
- Type Safety - Full TypeScript coverage
- Centralized State - Pinia store for predictable state management

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Test
```bash
# Watch mode (during development)
npm run test

# Run once
npm run test:run
```

### Usage
1. Upload images by clicking, dragging files, or pasting from clipboard (Ctrl+V)
2. Reorder images by dragging and dropping
3. Add captions to individual images (optional)
4. Use batch select mode to select and delete multiple images
5. Configure export settings (page size, compression quality, watermark)
6. Click "Export DOCX" or "Export PDF" to generate and download the document
7. Switch language between Traditional Chinese and English

---

## 中文

### 功能

**上傳與管理**
- 支援拖拽的多圖片上傳
- 剪貼簿貼上上傳 (Ctrl+V)
- 使用 SortableJS 拖拽排序圖片
- 批次選取與批次刪除
- 撤銷 / 重做所有圖片操作
- 每張圖片可輸入說明文字

**圖片處理**
- 可調整品質的自動圖片壓縮
- Web Worker 壓縮 (OffscreenCanvas)，不阻塞 UI
- Worker 不可用時自動回退至主線程壓縮
- 即時顯示原始與壓縮後的檔案大小統計

**匯出**
- 匯出為 **DOCX** 格式 (Word 文件)
- 匯出為 **PDF** 格式
- 可自訂頁面尺寸：A4、Letter 或自訂尺寸
- 支援浮水印文字
- 根據圖片累計高度智能分頁
- 自動編號 Figure 搭配可選說明文字

**使用者體驗**
- 圖片預覽 Lightbox，支援鍵盤導覽 (ESC / 方向鍵)
- Toast 通知系統 (取代原生 alert)
- 國際化 (i18n)：繁體中文與英文
- 響應式佈局

### 技術棧
- **Vue 3 + TypeScript** - 現代化響應式框架與類型安全
- **Vite** - 閃電般快速的建置工具
- **Pinia** - 集中式狀態管理
- **Composition API** - 使用組合式函數實現可重用邏輯
- **Web Worker** - 離主線程的圖片壓縮
- **docx** - DOCX 檔案生成
- **jsPDF** - PDF 檔案生成
- **SortableJS** - 拖拽功能
- **FileSaver.js** - 客戶端檔案儲存
- **Vitest** - 單元測試框架

### 專案架構

```
src/
├── components/
│   ├── ImageUploader/         # 主要功能模組
│   │   ├── index.vue           # 容器組件 (Pinia + i18n)
│   │   ├── UploadZone.vue      # 上傳區域 (拖拽 + 貼上)
│   │   ├── StatsPanel.vue      # 統計面板
│   │   ├── ExportSettings.vue  # 設定表單 (頁面尺寸、浮水印)
│   │   ├── ImageGrid.vue       # 圖片網格容器
│   │   ├── ImageCard.vue       # 單張圖片卡片 (選取、說明)
│   │   └── ActionButtons.vue   # 操作按鈕 (DOCX、PDF)
│   └── common/
│       ├── LoadingOverlay.vue  # 可重用的載入遮罩
│       ├── ToastContainer.vue  # Toast 通知
│       └── ImageLightbox.vue   # 全螢幕圖片預覽
├── composables/
│   ├── useImageUpload.ts       # 上傳與壓縮邏輯
│   ├── useImageSortable.ts     # Sortable 整合
│   ├── useImageExport.ts       # DOCX 與 PDF 匯出邏輯
│   ├── useToast.ts             # 全域 Toast 通知
│   └── useWorkerCompress.ts    # Web Worker 壓縮包裝器
├── stores/
│   └── imageStore.ts           # Pinia 狀態管理 (狀態、撤銷/重做、批次)
├── workers/
│   └── imageCompressWorker.ts  # Web Worker 圖片壓縮
├── i18n/
│   ├── index.ts                # i18n 組合式函數
│   ├── zhTW.ts                 # 繁體中文翻譯
│   └── en.ts                   # 英文翻譯
├── utils/
│   ├── imageCompressor.ts      # 圖片壓縮工具
│   ├── docxGenerator.ts        # DOCX 生成工具
│   └── pdfGenerator.ts         # PDF 生成工具
├── __tests__/                  # 單元測試 (Vitest)
│   ├── imageCompressor.test.ts
│   ├── docxGenerator.test.ts
│   ├── useToast.test.ts
│   └── i18n.test.ts
└── types/
    └── index.ts                # TypeScript 類型定義
```

**設計原則:**
- 單一職責 - 每個組件都有明確的單一目的
- 組合式函數 - 從組件中抽取可重用的業務邏輯
- Props 向下、Events 向上 - 清晰的資料流模式
- 類型安全 - 完整的 TypeScript 覆蓋
- 集中式狀態 - Pinia 狀態管理確保可預測的狀態

### 安裝
```bash
npm install
```

### 開發
```bash
npm run dev
```

### 建置
```bash
npm run build
```

### 測試
```bash
# 監聽模式（開發時使用）
npm run test

# 單次執行
npm run test:run
```

### 使用方式
1. 點擊、拖拽檔案或使用 Ctrl+V 從剪貼簿貼上以上傳圖片
2. 拖拽圖片以重新排序
3. 為個別圖片添加說明文字（選填）
4. 使用批次選取模式選取並刪除多張圖片
5. 設定匯出選項（頁面尺寸、壓縮品質、浮水印）
6. 點擊「匯出 DOCX」或「匯出 PDF」以生成並下載文件
7. 切換語言：繁體中文 / English
