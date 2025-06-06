import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Service Workerの更新方法
      injectRegister: "auto", // Service Worker登録スクリプトの自動挿入
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // キャッシュするファイル
      },
      manifest: {
        // アプリのマニフェスト TODO: 正式にアプリ名やアイコンを作成する
        name: "smile★たいむ",
        short_name: "すまうぉっち",
        description: "A simple time study application",
        display: "standalone",
        theme_color: "#1976d2", // アプリのテーマカラー
        background_color: "#ffffff", // アプリの背景色を白に設定
        icons: [
          // アプリのアイコン
          {
            src: "pwa-192x192.png", // publicフォルダからの相対パス
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", // publicフォルダからの相対パス
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    // プロキシ設定
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    host: true,
    // open: true,
  },
});
