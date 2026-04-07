import { useMemo } from "react";
import { getThisWeeksEvents, sortByDateTime } from "../utils/dateUtils";

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
                isPast: (item.time_start ? new Date(item.time_start) : new Date(item.schedule)) < today,
            }));
    }, [data, selectedGenres, showConfirmed]);

    const thisWeeksEvents = useMemo(() => 
        getThisWeeksEvents(data, showConfirmed), 
        [data, showConfirmed]
    );

    const currentEvents = useMemo(() => 
        processedData
            .filter(item => !item.isPast)
            .sort((a, b) => sortByDateTime(a, b)),
        [processedData]
    );

    const pastEvents = useMemo(() => 
        processedData
            .filter(item => item.isPast)
            .sort((a, b) => sortByDateTime(a, b, true)),
        [processedData]
    );

    return {
        currentEvents,
        pastEvents,
        thisWeeksEvents,
    };
};