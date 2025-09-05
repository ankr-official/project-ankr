import { useMemo } from "react";
import { getThisWeeksEvents } from "../utils/dateUtils";

export const useEventData = (data, selectedGenres, showConfirmed = true) => {
    const processedData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return data
            .filter(item => item.confirm === showConfirmed)
            .filter(item => {
                if (selectedGenres.includes("all")) return true;
                if (selectedGenres.length === 1) {
                    return selectedGenres.some(genre =>
                        item.genre.includes(genre)
                    );
                }
                return selectedGenres.every(genre =>
                    item.genre.includes(genre)
                );
            })
            .map(item => ({
                ...item,
                scheduleDate: new Date(item.schedule),
                isPast: new Date(item.schedule) < today,
            }));
    }, [data, selectedGenres, showConfirmed]);

    const thisWeeksEvents = useMemo(() => 
        getThisWeeksEvents(data, showConfirmed), 
        [data, showConfirmed]
    );

    const currentEvents = useMemo(() => 
        processedData
            .filter(item => !item.isPast)
            .sort((a, b) => a.scheduleDate - b.scheduleDate),
        [processedData]
    );

    const pastEvents = useMemo(() => 
        processedData
            .filter(item => item.isPast)
            .sort((a, b) => b.scheduleDate - a.scheduleDate),
        [processedData]
    );

    return {
        currentEvents,
        pastEvents,
        thisWeeksEvents,
    };
};