import { useState, useEffect } from "react";
import { isoToTime, isoToLocal, toArray } from "../utils/eventFormUtils";

/**
 * Shared form state and side-effects for event-related modals.
 * Handles: ESC key, body scroll lock, common field state, genre management, location TBD.
 */
export function useEventForm(initialData = {}, onClose) {
    const [form, setForm] = useState(() => ({
        event_name: initialData.event_name ?? "",
        schedule: isoToLocal(initialData.schedule) || new Date().toISOString().slice(0, 10),
        location: initialData.location ?? "",
        genre: toArray(initialData.genre),
        event_url: initialData.event_url ?? "",
        time_start: isoToTime(initialData.time_start),
        time_entrance: isoToTime(initialData.time_entrance),
        time_end: isoToTime(initialData.time_end),
        etc: initialData.etc ?? "",
    }));

    const [locationTbd, setLocationTbd] = useState(
        initialData?.location === "장소 미정",
    );

    // ESC to close
    useEffect(() => {
        const handle = e => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handle);
        return () => document.removeEventListener("keydown", handle);
    }, [onClose]);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const toggleGenre = genre =>
        setForm(prev => ({
            ...prev,
            genre: prev.genre?.includes(genre)
                ? prev.genre.filter(g => g !== genre)
                : [...(prev.genre ?? []), genre],
        }));

    const addCustomGenres = raw => {
        const tags = raw.split(",").map(s => s.trim()).filter(Boolean);
        if (!tags.length) return;
        setForm(prev => {
            const next = [...(prev.genre ?? [])];
            tags.forEach(tag => { if (!next.includes(tag)) next.push(tag); });
            return { ...prev, genre: next };
        });
    };

    const removeGenre = genre =>
        setForm(prev => ({ ...prev, genre: prev.genre.filter(g => g !== genre) }));

    const handleLocationTbdChange = checked => {
        setLocationTbd(checked);
        set("location", checked ? "장소 미정" : "");
    };

    return {
        form,
        set,
        toggleGenre,
        addCustomGenres,
        removeGenre,
        locationTbd,
        handleLocationTbdChange,
    };
}
