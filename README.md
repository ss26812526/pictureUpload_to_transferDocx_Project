# Image to DOCX Converter

## English

### Features
- Multi-image upload with drag-and-drop support
- Drag-and-drop image reordering using SortableJS
- Automatic image compression with adjustable quality settings
- Export to DOCX format with customizable image dimensions
- Smart pagination based on cumulative image height
- Real-time statistics showing original and compressed file sizes
- **Modular component architecture** following Vue 3 best practices

### Tech Stack
- **Vue 3 + TypeScript** - Modern reactive framework with type safety
- **Vite** - Lightning-fast build tool
- **Composition API** - Reusable logic with composables
- **docx** - DOCX file generation
- **SortableJS** - Drag-and-drop functionality
- **FileSaver.js** - Client-side file saving

### Project Architecture

```
src/
├── components/
│   ├── ImageUploader/         # Main feature module
│   │   ├── index.vue           # Container component
│   │   ├── UploadZone.vue      # Upload area
│   │   ├── StatsPanel.vue      # Statistics display
│   │   ├── ExportSettings.vue  # Settings form
│   │   ├── ImageGrid.vue       # Image grid container
│   │   ├── ImageCard.vue       # Individual image card
│   │   └── ActionButtons.vue   # Action buttons
│   └── common/
│       └── LoadingOverlay.vue  # Reusable loading overlay
├── composables/
│   ├── useImageUpload.ts       # Upload & processing logic
│   ├── useImageSortable.ts     # Sortable integration
│   └── useImageExport.ts       # Export logic
├── utils/
│   ├── imageCompressor.ts      # Image compression utilities
│   └── docxGenerator.ts        # DOCX generation utilities
└── types/
    └── index.ts                # TypeScript type definitions
```

**Design Principles:**
- ✅ **Single Responsibility** - Each component has one clear purpose
- ✅ **Composables for Logic** - Reusable business logic extracted from components
- ✅ **Props Down, Events Up** - Clear data flow pattern
- ✅ **Type Safety** - Full TypeScript coverage

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

### Usage
1. Upload images by clicking or dragging files to the upload area
2. Reorder images by dragging and dropping (using the drag handle)
3. Configure export settings (image dimensions, compression quality, page height)
4. Click "Export DOCX" to generate and download the Word document

---

## 中文

### 功能
- 支援拖拽的多圖片上傳
- 使用 SortableJS 拖拽排序圖片
- 可調整品質設定的自動圖片壓縮
- 匯出為 DOCX 格式，可自訂圖片尺寸
- 根據圖片累計高度智能分頁
- 即時顯示原始與壓縮後的檔案大小統計
- **模組化組件架構**，遵循 Vue 3 最佳實踐

### 技術棧
- **Vue 3 + TypeScript** - 現代化響應式框架與類型安全
- **Vite** - 閃電般快速的建置工具
- **Composition API** - 使用組合式函數實現可重用邏輯
- **docx** - DOCX 檔案生成
- **SortableJS** - 拖拽功能
- **FileSaver.js** - 客戶端檔案儲存

### 專案架構

```
src/
├── components/
│   ├── ImageUploader/         # 主要功能模組
│   │   ├── index.vue           # 容器組件
│   │   ├── UploadZone.vue      # 上傳區域
│   │   ├── StatsPanel.vue      # 統計面板
│   │   ├── ExportSettings.vue  # 設定表單
│   │   ├── ImageGrid.vue       # 圖片網格容器
│   │   ├── ImageCard.vue       # 單張圖片卡片
│   │   └── ActionButtons.vue   # 操作按鈕
│   └── common/
│       └── LoadingOverlay.vue  # 可重用的載入遮罩
├── composables/
│   ├── useImageUpload.ts       # 上傳與處理邏輯
│   ├── useImageSortable.ts     # Sortable 整合
│   └── useImageExport.ts       # 匯出邏輯
├── utils/
│   ├── imageCompressor.ts      # 圖片壓縮工具
│   └── docxGenerator.ts        # DOCX 生成工具
└── types/
    └── index.ts                # TypeScript 類型定義
```

**設計原則:**
- ✅ **單一職責** - 每個組件都有明確的單一目的
- ✅ **組合式函數** - 從組件中抽取可重用的業務邏輯
- ✅ **Props 向下、Events 向上** - 清晰的資料流模式
- ✅ **類型安全** - 完整的 TypeScript 覆蓋

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

### 使用方式
1. 點擊或拖拽檔案至上傳區域以上傳圖片
2. 使用拖拽手柄拖拽圖片以重新排序
3. 設定匯出選項（圖片尺寸、壓縮品質、頁面高度）
4. 點擊「匯出 DOCX」以生成並下載 Word 文件

---

## Project Description

A Vue 3 web application that enables users to upload multiple images, arrange them through drag-and-drop, apply automatic compression, and export them into a professionally formatted Word document (.docx) with smart pagination.

This project demonstrates modern Vue 3 development practices including:
- Modular component architecture
- Composition API with reusable composables
- TypeScript for type safety
- Clean separation of concerns

基於 Vue 3 的網頁應用程式，讓使用者能夠上傳多張圖片、透過拖拽排列順序、套用自動壓縮，並匯出成具有智能分頁功能的 Word 文件（.docx）。

此專案展示了現代 Vue 3 開發實踐，包括:
- 模組化組件架構
- Composition API 與可重用組合式函數
- TypeScript 提供類型安全
- 清晰的關注點分離

---

## Reference Documentation

For best practices on refactoring and component design, see [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md).

關於重構和組件設計的最佳實踐，請參閱 [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)。
