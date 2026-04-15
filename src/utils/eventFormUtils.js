import { GENRE_COLORS } from "../constants";

export const GENRES = Object.keys(GENRE_COLORS).filter(g => g !== "default");

export const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors appearance-none";

export const isoToTime = iso => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (isNaN(d)) return "";
        const pad = n => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return "";
    }
};

export const isoToLocal = iso => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (isNaN(d)) return iso.slice(0, 10);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
        return iso.slice(0, 10);
    }
};

export const sortGenres = (genres) =>
    [...genres].sort((a, b) => {
        const ia = GENRES.indexOf(a);
        const ib = GENRES.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
    });

export const toArray = val => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string")
        return val.split(",").map(s => s.trim()).filter(Boolean);
    return Object.values(val);
};

export const timeToISO = (timeVal, scheduleDateStr) => {
    if (!timeVal) return null;
    const datePart = scheduleDateStr?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    try {
        return new Date(`${datePart}T${timeVal}`).toISOString();
    } catch {
        return null;
    }
};

export const isValidUrl = url => {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

/** Transforms common form fields into Firebase-ready data.
 *  Does NOT handle confirm, img_url, reason — each modal manages those. */
export const buildSubmitData = form => {
    const data = {
        ...form,
        genre: Array.isArray(form.genre) ? form.genre.join(", ") : form.genre || "",
        schedule: new Date(form.schedule).toISOString(),
        time_start: timeToISO(form.time_start, form.schedule),
        time_entrance: timeToISO(form.time_entrance, form.schedule),
        time_end: timeToISO(form.time_end, form.schedule),
    };
    if (!data.time_start) data.time_start = null;
    if (!data.time_entrance) data.time_entrance = null;
    if (!data.time_end) data.time_end = null;
    if (!data.etc) data.etc = null;
    return data;
};
