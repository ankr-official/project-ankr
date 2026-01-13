import { useState, useEffect } from "react";

const THEME_STORAGE_KEY = "ankr_theme";

// Get system preference
const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
};

// Load theme from localStorage or system preference
const getInitialTheme = () => {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        // If no saved preference, use system preference
        return getSystemTheme();
    } catch (error) {
        console.error("Failed to load theme:", error);
        return getSystemTheme();
    }
};

export const useTheme = () => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Apply theme to document root
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // Save to localStorage
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e) => {
            // Only update if user hasn't set a manual preference
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (!savedTheme) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return { theme, setTheme, toggleTheme };
};
