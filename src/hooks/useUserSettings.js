import { useState, useEffect } from "react";

// localStorage keys
const STORAGE_KEYS = {
    SELECTED_GENRES: "ankr_selected_genres",
    VIEW_MODE: "ankr_view_mode",
};

// Load user settings from localStorage
const loadUserSettings = () => {
    try {
        const settings = {
            selectedGenres: JSON.parse(
                localStorage.getItem(STORAGE_KEYS.SELECTED_GENRES)
            ) || ["all"],
            viewMode:
                localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || "calendar",
        };

        return settings;
    } catch (error) {
        console.error("Failed to load user settings:", error);
        return {
            selectedGenres: ["all"],
            viewMode: "calendar",
        };
    }
};

// Save user settings to localStorage
const saveUserSettings = (key, value) => {
    try {
        const valueToStore = Array.isArray(value)
            ? JSON.stringify(value)
            : value;
        localStorage.setItem(key, valueToStore);
    } catch (error) {
        console.error("Failed to save user settings:", error);
    }
};

export const useUserSettings = () => {
    const userSettings = loadUserSettings();
    const [selectedGenres, setSelectedGenres] = useState(
        userSettings.selectedGenres
    );
    const [viewMode, setViewMode] = useState(userSettings.viewMode);

    // Save settings when they change
    useEffect(() => {
        saveUserSettings(STORAGE_KEYS.SELECTED_GENRES, selectedGenres);
    }, [selectedGenres]);

    useEffect(() => {
        saveUserSettings(STORAGE_KEYS.VIEW_MODE, viewMode);
    }, [viewMode]);

    const handleGenreChange = genre => {
        if (genre === "all") {
            setSelectedGenres(["all"]);
            return;
        }

        setSelectedGenres(prev => {
            const newGenres = prev.filter(g => g !== "all");
            if (newGenres.includes(genre)) {
                const updatedGenres = newGenres.filter(g => g !== genre);
                return updatedGenres.length === 0 ? ["all"] : updatedGenres;
            }
            return [...newGenres, genre];
        });
    };

    return {
        selectedGenres,
        viewMode,
        setViewMode,
        handleGenreChange,
    };
};