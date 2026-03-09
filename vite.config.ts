import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "popup.html"),
                blocked: resolve(__dirname, "blocked.html"),
                background: resolve(__dirname, "src/background/index.ts"),
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === "background") return "[name].js";
                    return "assets/[name]-[hash].js";
                },
            },
        },
    },
});
