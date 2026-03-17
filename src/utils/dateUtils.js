export const formatDate = (dateString, timeStart) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = days[date.getDay()];
        const pad = n => String(n).padStart(2, "0");
        const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        if (timeStart) {
            const startTime = new Date(timeStart);
            const hours = startTime.getHours();
            const timeType = hours >= 6 && hours < 17 ? "☀️" : "🌙";
            return `${localDate} (${dayOfWeek}) ${timeType}`;
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
        .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
};
