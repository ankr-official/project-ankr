import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: true,
    },
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("framer-motion")) return "motion";
                    if (id.includes("firebase")) return "firebase";
                    if (
                        id.includes("react-dom") ||
                        id.includes("react-router-dom") ||
                        id.includes("/react/")
                    )
                        return "vendor";
                },
            },
        },
    },
});