// Shift any date value by +9h so getUTC* methods return KST values.
export const toKSTDate = (d) => new Date(new Date(d).getTime() + 9 * 60 * 60 * 1000);

// Returns "YYYY-MM-DD" in KST for any date value.
export const kstDateStr = (d) => toKSTDate(d).toISOString().slice(0, 10);

export const formatDate = (dateString, timeStart, timeEnd) => {
    if (!dateString) return "";
    try {
        const kst = toKSTDate(dateString);
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = days[kst.getUTCDay()];
        const pad = n => String(n).padStart(2, "0");
        const localDate = `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}`;

        if (timeStart) {
            const kstS = toKSTDate(timeStart);
            const hs = kstS.getUTCHours();
            const timeType = hs >= 6 && hs < 17 ? "☀️" : "🌙";
            const start = `${pad(hs)}:${pad(kstS.getUTCMinutes())}`;
            if (timeEnd) {
                const kstE = toKSTDate(timeEnd);
                const end = `${pad(kstE.getUTCHours())}:${pad(kstE.getUTCMinutes())}`;
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
        const kst = toKSTDate(dateString);
        const hours = kst.getUTCHours();
        const minutes = kst.getUTCMinutes();
        const pad = n => String(n).padStart(2, "0");
        const ampm = hours < 12 ? "AM" : "PM";
        return `${ampm} ${pad(hours)}:${pad(minutes)}`;
    } catch (e) {
        return dateString;
    }
};

// Primary: schedule date. Secondary: time_entrance ?? time_start within same date (nulls last).
// desc=false → ascending (upcoming), desc=true → descending (past/recent).
export const sortByDateTime = (a, b, desc = false) => {
    const dateA = new Date(a.schedule);
    const dateB = new Date(b.schedule);
    const dateDiff = dateA - dateB;
    if (dateDiff !== 0) return desc ? -dateDiff : dateDiff;
    const aTime = a.time_entrance || a.time_start;
    const bTime = b.time_entrance || b.time_start;
    if (aTime && bTime) {
        const timeDiff = new Date(aTime) - new Date(bTime);
        return desc ? -timeDiff : timeDiff;
    }
    if (aTime) return -1;
    if (bTime) return 1;
    return 0;
};

export const getThisWeeksEvents = (data, showConfirmed = true) => {
    const kstNow = toKSTDate(new Date());
    const pad = n => String(n).padStart(2, "0");
    const todayStr = `${kstNow.getUTCFullYear()}-${pad(kstNow.getUTCMonth() + 1)}-${pad(kstNow.getUTCDate())}`;
    const todayKST = new Date(`${todayStr}T00:00:00+09:00`);
    const nextWeekKST = new Date(todayKST.getTime() + 7 * 24 * 60 * 60 * 1000);

    const now = new Date();

    return data
        .filter(item => {
            const eventDate = new Date(String(item.schedule).slice(0, 10) + "T00:00:00+09:00");
            if (eventDate < todayKST || eventDate >= nextWeekKST) return false;
            if (item.confirm !== showConfirmed) return false;
            const cutoff = item.time_entrance || item.time_start;
            if (cutoff) return new Date(cutoff) > now;
            return true;
        })
        .sort((a, b) => sortByDateTime(a, b));
};
