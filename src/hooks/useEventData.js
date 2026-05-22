import { useMemo } from "react";
import { getThisWeeksEvents, sortByDateTime, toKSTDate } from "../utils/dateUtils";

export const useEventData = (data, selectedGenres, showConfirmed = true) => {
    const processedData = useMemo(() => {
        const kstNow = toKSTDate(new Date());
        const pad = n => String(n).padStart(2, "0");
        const todayStr = `${kstNow.getUTCFullYear()}-${pad(kstNow.getUTCMonth() + 1)}-${pad(kstNow.getUTCDate())}`;
        const todayKSTMidnight = new Date(`${todayStr}T00:00:00+09:00`);

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
                scheduleDate: toKSTDate(item.schedule),
                isPast: (item.time_start ? new Date(item.time_start) : new Date(String(item.schedule).slice(0, 10) + "T00:00:00+09:00")) < todayKSTMidnight,
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