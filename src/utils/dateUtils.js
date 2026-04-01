export const formatDate = (dateString, timeStart, timeEnd) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = days[date.getDay()];
        const pad = n => String(n).padStart(2, "0");
        const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        if (timeStart) {
            const ds = new Date(timeStart);
            const hs = ds.getHours();
            const timeType = hs >= 6 && hs < 17 ? "☀️" : "🌙";
            const start = `${pad(hs)}:${pad(ds.getMinutes())}`;
            if (timeEnd) {
                const de = new Date(timeEnd);
                const end = `${pad(de.getHours())}:${pad(de.getMinutes())}`;
                return `${localDate} (${dayOfWeek}) ${timeType} ${start} ~ ${end}`;
            }
            return `${localDate} (${dayOfWeek}) ${timeType} ${start}`;
        }

        return `${localDate} (${dayOfWeek})`;
    } catch (e) {
        return dateString;
    }
};

export const formatTime = dateString => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const hours = date.getHours();
        const ampm = hours < 12 ? "AM" : "PM";
        const formattedTime = date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${ampm} ${formattedTime}`;
    } catch (e) {
        return dateString;
    }
};

// Primary: schedule date. Secondary: time_start within same date (nulls last).
// desc=false → ascending (upcoming), desc=true → descending (past/recent).
export const sortByDateTime = (a, b, desc = false) => {
    const dateA = new Date(a.schedule);
    const dateB = new Date(b.schedule);
    const dateDiff = dateA - dateB;
    if (dateDiff !== 0) return desc ? -dateDiff : dateDiff;
    if (a.time_start && b.time_start) {
        const timeDiff = new Date(a.time_start) - new Date(b.time_start);
        return desc ? -timeDiff : timeDiff;
    }
    if (a.time_start) return -1;
    if (b.time_start) return 1;
    return 0;
};

export const getThisWeeksEvents = (data, showConfirmed = true) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return data
        .filter(item => {
            const eventDate = new Date(item.schedule);
            return (
                eventDate >= today &&
                eventDate < nextWeek &&
                item.confirm === showConfirmed
            );
        })
        .sort((a, b) => sortByDateTime(a, b));
};
