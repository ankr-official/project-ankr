import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    isSameDay,
    isBefore,
    startOfDay,
    startOfWeek,
    endOfWeek,
    addDays,
} from "date-fns";
import { ko } from "date-fns/locale";
import { GENRE_COLORS } from "../constants";
import { KOREAN_HOLIDAYS, getLunarHolidays } from "../constants/holidays";

const EventCalendar = ({
    events,
    onEventSelect,
    selectedGenres = ["all"],
    onGenreChange,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = startOfDay(new Date());

    // 달력의 시작일과 종료일 계산 (이전 달의 날짜들도 포함)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: ko }); // 일요일부터 시작
    const calendarEnd = endOfWeek(monthEnd, { locale: ko }); // 토요일로 끝

    // 달력에 표시할 모든 날짜 생성
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // 공휴일 확인 함수
    const getHoliday = date => {
        const monthDay = format(date, "MMdd");
        const year = date.getFullYear();
        const lunarHolidays = getLunarHolidays(year);

        return KOREAN_HOLIDAYS[monthDay] || lunarHolidays[monthDay] || null;
    };

    const prevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        );
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
        );
    };

    // 장르 필터링된 이벤트 가져오기
    const getFilteredEvents = dayEvents => {
        if (selectedGenres.includes("all")) return dayEvents;

        return dayEvents.filter(event => {
            const eventGenres =
                event.genre?.split(",").map(g => g.trim()) || [];
            if (selectedGenres.length === 1) {
                return selectedGenres.some(genre =>
                    eventGenres.includes(genre)
                );
            }
            return selectedGenres.every(genre => eventGenres.includes(genre));
        });
    };

    const getEventsForDay = day => {
        const dayEvents = events.filter(event =>
            isSameDay(new Date(event.schedule), day)
        );
        const filteredEvents = getFilteredEvents(dayEvents);

        // 장르 색상별로 정렬
        return filteredEvents.sort((a, b) => {
            const genreA = a.genre?.split(",")[0]?.trim() || "";
            const genreB = b.genre?.split(",")[0]?.trim() || "";

            if (genreA === genreB) {
                return a.event_name.localeCompare(b.event_name);
            }

            return genreA.localeCompare(genreB);
        });
    };

    const isPastDate = date => {
        return isBefore(startOfDay(date), today);
    };

    return (
        <div className="p-2 bg-gray-800 rounded-lg shadow-lg lg:p-4">
            {/* 장르 필터 */}
            <div className="top-0 z-10 p-2 mb-4 bg-gray-700 rounded-lg bg-opacity-20">
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                    {[
                        "all",
                        ...Object.keys(GENRE_COLORS).filter(
                            genre => genre !== "default"
                        ),
                    ].map(genre => (
                        <button
                            key={genre}
                            onClick={() => onGenreChange(genre)}
                            className={`px-2.5 py-1.5 lg:px-3 lg:py-1 text-sm font-medium rounded-full transition-colors ${
                                selectedGenres.includes(genre)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            {genre === "all" ? "전체" : genre}
                        </button>
                    ))}
                </div>
            </div>
            {/* 월 이동 컨트롤 */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-3 text-lg text-gray-400 bg-indigo-900 lg:pl-6 lg:pr-6 lg:p-2 hover:text-white lg:text-base"
                >
                    ←
                </button>
                <h2 className="text-lg font-semibold text-white lg:text-xl">
                    {format(currentDate, "yyyy년 MM월", { locale: ko })}
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-3 text-lg text-gray-400 bg-indigo-900 lg:p-2 lg:pl-6 lg:pr-6 hover:text-white lg:text-base"
                >
                    →
                </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-1 lg:mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map(day => (
                    <div
                        key={day}
                        className="py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-center text-gray-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-0.5 lg:gap-1">
                {days.map((day, dayIdx) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isPast = isPastDate(day);
                    const holiday = getHoliday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[80px] lg:min-h-[100px] p-0.5 lg:p-1 rounded ${
                                !isCurrentMonth
                                    ? "bg-gray-700 bg-opacity-10"
                                    : isPast
                                      ? "bg-gray-700 bg-opacity-40"
                                      : "bg-gray-700 bg-opacity-80"
                            } ${isToday(day) ? "ring-2 ring-indigo-500" : ""}`}
                        >
                            <div className="flex flex-col">
                                <div
                                    className={`text-right text-xs lg:text-sm ${
                                        holiday
                                            ? "text-red-400"
                                            : day.getDay() === 0
                                              ? "text-red-400"
                                              : day.getDay() === 6
                                                ? "text-blue-400"
                                                : "text-gray-300"
                                    } ${!isCurrentMonth ? "opacity-50" : ""} ${isPast ? "opacity-50" : ""}`}
                                >
                                    {format(day, "d")}
                                </div>
                                {holiday && (
                                    <div
                                        className={`text-right text-[10px] lg:text-xs text-red-400 ${!isCurrentMonth ? "opacity-50" : ""}`}
                                    >
                                        {holiday}
                                    </div>
                                )}
                            </div>
                            <div
                                className={`mt-0.5 lg:mt-1 space-y-1 ${!isCurrentMonth || isPast ? "opacity-50" : ""}`}
                            >
                                {dayEvents.map(event => {
                                    const firstGenre = event.genre
                                        ?.split(",")[0]
                                        ?.trim();
                                    const genreColor =
                                        GENRE_COLORS[firstGenre] ||
                                        GENRE_COLORS.default;

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => onEventSelect(event)}
                                            className={`p-0.5 pt-1 lg:p-1 text-[10px] lg:text-xs truncate rounded cursor-pointer hover:opacity-80 ${genreColor}`}
                                        >
                                            <div className="font-medium text-white truncate">
                                                {event.event_name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-2 pt-4 text-xs text-gray-200 lg:p-4 lg:pt-8 lg:text-sm">
                <p>
                    * 현재 대체휴무일 등은 적용되지 않는 점 양해 부탁드립니다.
                </p>
            </div>
        </div>
    );
};

export default EventCalendar;
