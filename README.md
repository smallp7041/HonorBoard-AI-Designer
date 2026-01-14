# HonorBoard AI Designer

HonorBoard AI Designer 是一個基於 React 的網頁應用程式，結合 AI 技術（Gemini）協助使用者製作榮譽榜單。使用者可以自動生成設計、下載 PDF 或圖片。

## 🚀 專案設置 (Setup)

### 1. 安裝相依套件 (Install Dependencies)

請在專案根目錄執行以下指令：

```bash
npm install
```

### 2. 環境變數設定 (Environment Config)

請新增 `.env` 檔案，並設定你的 API Key：

```env
GEMINI_API_KEY=your_api_key_here
```

> ⚠️ 注意：`.env` 檔案包含敏感資訊，請勿上傳至 GitHub。

### 3. 啟動開發伺服器 (Start Dev Server)

```bash
npm run dev
```

啟動後請開啟瀏覽器訪問 `http://localhost:3000` (預設)。

## 📦 建置與部署 (Build & Deploy)

### 建置專案

```bash
npm run build
```

建置後的檔案會位於 `dist/` 資料夾。

### 自動化部署 (GitHub Actions)

本專案已設定 GitHub Actions，當推送到 `main` 分支時，會自動部署至 GitHub Pages。

1. 到 GitHub Repository 的 **Settings** > **Pages**。
2. 在 **Build and deployment** 區塊，將 **Source** 設定為 **GitHub Actions**。
3. 推送程式碼到 `main` 分支後，Actions 將會自動執行並部署。

## 🛡️ 檔案忽略規則 (.gitignore)

專案已設定 `.gitignore` 以避免上傳以下檔案：
- `node_modules/` (相依套件)
- `dist/` (建置產物)
- `.env` (環境變數/隱私檔)
- `.DS_Store` (Mac 系統檔)

## 🛠️ 技術棧 (Tech Stack)

- **Framework**: React, Vite
- **Language**: TypeScript
- **AI Integration**: Google Gemini AI
- **Utilities**: html-to-image, jspdf
