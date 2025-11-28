import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),

    // 🔥 Plugin PWA
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "SyntaxWeb Finance",
        short_name: "Finance",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#0a1a3f",
        description: "Sistema de gestão financeira pessoal desenvolvido pela SyntaxWeb.",
        icons: [
          {
            src: "/icons/192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/180x180.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
