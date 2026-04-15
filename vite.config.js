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
                manualChunks: {
                    firebase: [
                        "firebase/app",
                        "firebase/database",
                        "firebase/auth",
                        "firebase/functions",
                    ],
                    motion: ["framer-motion"],
                },
            },
        },
    },
});