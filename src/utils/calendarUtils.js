/**
 * Safari 브라우저인지 확인하는 함수
 * @returns {boolean}
 */
export const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
};

/**
 * Google Calendar에 이벤트를 추가하는 함수
 * @param {Object} event - 이벤트 데이터
 */
export const addToGoogleCalendar = event => {
    const formatDateForGoogle = date => {
        if (!date) return "";

        const dateObj = new Date(date);
        // YYYYMMDD 형식으로 반환 (종일 이벤트)
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    };

    // 시작 날짜와 종료 날짜 설정
    const startDate = formatDateForGoogle(event.schedule);

    // 종료 날짜는 다음 날로 설정 (Google Calendar의 종일 이벤트 규칙)
    const nextDay = new Date(event.schedule);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = formatDateForGoogle(nextDay);

    // Google Calendar URL 생성
    const googleCalendarUrl = new URL(
        "https://calendar.google.com/calendar/render"
    );
    googleCalendarUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarUrl.searchParams.append("text", event.event_name);
    googleCalendarUrl.searchParams.append("dates", `${startDate}/${endDate}`);
    googleCalendarUrl.searchParams.append("allday", "true");

    // 추가 정보 설정
    if (event.etc) {
        googleCalendarUrl.searchParams.append("details", event.etc);
    }
    if (event.location) {
        googleCalendarUrl.searchParams.append("location", event.location);
    }
    if (event.event_url) {
        googleCalendarUrl.searchParams.append("url", event.event_url);
    }

    // 새 창에서 Google Calendar 열기
    window.open(googleCalendarUrl.toString(), "_blank", "noopener,noreferrer");
};

/**
 * 사용자의 기기/브라우저 환경을 감지하는 함수
 * @returns {Object} 환경 정보
 */
export const detectEnvironment = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMacOS = /macintosh/.test(ua) && !/mobile/.test(ua);
    const isSafari = ua.includes("safari") && !ua.includes("chrome");

    return {
        isIOS,
        isMacOS,
        isSafari,
        isAppleDevice: isIOS || isMacOS,
    };
};
