export const formatDate = (dateString, timeStart) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1); // Subtract one day
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        let dayIndex = date.getDay();
        dayIndex = (dayIndex - 1 + 7) % 7; // Subtract one day and handle negative values
        const dayOfWeek = days[dayIndex];

        // time_start가 있는 경우에만 시간 정보 추가
        if (timeStart) {
            const startTime = new Date(timeStart);
            const hours = startTime.getHours();
            const timeType = hours >= 6 && hours < 18 ? "☀️" : "🌙"; // 06:00~17:59는 낮, 나머지는 심야
            return `${date.toISOString().split("T")[0]} (${dayOfWeek}) ${timeType}`;
        }

        return `${date.toISOString().split("T")[0]} (${dayOfWeek})`;
    } catch (e) {
        return dateString;
    }
};

export const formatTime = dateString => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - 5);
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

export const getThisWeeksEvents = data => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return data
        .filter(item => {
            const eventDate = new Date(item.schedule);
            return eventDate >= today && eventDate < nextWeek;
        })
        .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
};
