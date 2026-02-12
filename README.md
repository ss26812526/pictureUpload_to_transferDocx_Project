# Image to DOCX Converter

## English

### Features
- Multi-image upload with drag-and-drop support
- Drag-and-drop image reordering using SortableJS
- Automatic image compression with adjustable quality settings
- Export to DOCX format with customizable image dimensions
- Smart pagination based on cumulative image height
- Real-time statistics showing original and compressed file sizes

### Tech Stack
- Vue 3 + TypeScript
- Vite
- docx - DOCX file generation
- SortableJS - Drag-and-drop functionality
- FileSaver.js - Client-side file saving

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
2. Reorder images by dragging and dropping
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

### 技術棧
- Vue 3 + TypeScript
- Vite
- docx - DOCX 檔案生成
- SortableJS - 拖拽功能
- FileSaver.js - 客戶端檔案儲存

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
2. 拖拽圖片以重新排序
3. 設定匯出選項（圖片尺寸、壓縮品質、頁面高度）
4. 點擊「匯出 DOCX」以生成並下載 Word 文件

---

## Project Description

A Vue 3 web application that enables users to upload multiple images, arrange them through drag-and-drop, apply automatic compression, and export them into a professionally formatted Word document (.docx) with smart pagination.

基於 Vue 3 的網頁應用程式，讓使用者能夠上傳多張圖片、透過拖拽排列順序、套用自動壓縮，並匯出成具有智能分頁功能的 Word 文件（.docx）。
