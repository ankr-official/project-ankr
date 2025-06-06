import { useState, useEffect } from "react";
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
import { getHolidayForDate, getHolidaysForYear } from "../utils/holidayApi";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";
import { formatDate } from "../utils/dateUtils";

const EventCalendar = ({
    events,
    onEventSelect,
    selectedGenres = ["all"],
    onGenreChange,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const today = startOfDay(new Date());

    // 달력의 시작일과 종료일 계산 (이전 달의 날짜들도 포함)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: ko }); // 일요일부터 시작
    const calendarEnd = endOfWeek(monthEnd, { locale: ko }); // 토요일로 끝

    // 달력에 표시할 모든 날짜 생성
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // 공휴일 데이터 가져오기
    useEffect(() => {
        const fetchHolidays = async () => {
            const year = currentDate.getFullYear();

            // 이미 로딩 중이면 중복 요청 방지
            if (isLoading) return;

            setIsLoading(true);
            try {
                // 연도 단위로 데이터를 가져옴 (캐시 활용)
                const yearHolidays = await getHolidaysForYear(year);
                setHolidays(yearHolidays);
            } catch (error) {
                console.error("공휴일 데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHolidays();
    }, [currentDate.getFullYear()]); // 연도가 변경될 때만 실행

    // 공휴일 확인 함수
    const getHoliday = date => {
        const monthDay = format(date, "MMdd");
        return holidays[monthDay] || null;
    };

    const prevMonth = () => {
        const newDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1
        );
        setCurrentDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1
        );
        setCurrentDate(newDate);
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

        return filteredEvents.sort((a, b) => {
            const genreA = a.genre?.split(",")[0]?.trim() || "";
            const genreB = b.genre?.split(",")[0]?.trim() || "";

            if (genreA === "원곡") return -1;
            if (genreB === "원곡") return 1;

            if (genreA === genreB) {
                return a.event_name.localeCompare(b.event_name);
            }

            return genreA.localeCompare(genreB);
        });
    };

    const handleDateClick = day => {
        setSelectedDate(day);
        // 스크롤을 이벤트 리스트로 이동
        const eventListElement = document.getElementById("event-list");
        if (eventListElement) {
            eventListElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    const isPastDate = date => {
        return isBefore(startOfDay(date), today);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg">
            {/* 장르 필터 */}
            <div className="top-0 z-10 p-4 mb-6 bg-gray-900 rounded-lg rounded-bl-none rounded-br-none">
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
            <div className="p-2 lg:p-4">
                {/* 월 이동 컨트롤 */}
                <div className="flex items-center justify-center gap-8 mb-4">
                    <button
                        onClick={prevMonth}
                        disabled={isLoading}
                        className={`p-3 text-lg text-gray-400 bg-indigo-900 lg:pl-6 lg:pr-6 lg:p-2 hover:text-white lg:text-base ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        ←
                    </button>
                    <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-white lg:text-xl">
                            {format(currentDate, "yyyy년 MM월", { locale: ko })}
                        </h2>
                        {isLoading && (
                            <div className="w-4 h-4 ml-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
                        )}
                    </div>
                    <button
                        onClick={nextMonth}
                        disabled={isLoading}
                        className={`p-3 text-lg text-gray-400 bg-indigo-900 lg:p-2 lg:pl-6 lg:pr-6 hover:text-white lg:text-base ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
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
                        const holidayList = getHoliday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDateClick(day)}
                                className={`min-h-[80px] lg:min-h-[100px] p-0.5 lg:p-1 rounded cursor-pointer ${
                                    !isCurrentMonth
                                        ? "bg-gray-700 bg-opacity-10"
                                        : isPast
                                          ? "bg-gray-700 bg-opacity-40"
                                          : "bg-gray-700 bg-opacity-80"
                                } ${isToday(day) ? "ring-2 ring-indigo-500" : ""} ${
                                    selectedDate && isSameDay(day, selectedDate)
                                        ? "ring-2 ring-indigo-300"
                                        : ""
                                }`}
                            >
                                <div className="flex flex-col">
                                    <div
                                        className={`text-right text-xs lg:text-sm ${
                                            holidayList
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
                                    {holidayList && (
                                        <div className="flex flex-col items-end space-y-0.5">
                                            {holidayList.map(
                                                (holiday, index) => (
                                                    <div
                                                        key={index}
                                                        className={`text-right text-[10px] lg:text-xs text-red-400 ${!isCurrentMonth ? "opacity-50" : ""}`}
                                                    >
                                                        {holiday}
                                                    </div>
                                                )
                                            )}
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
                                                className={`p-0.5 pt-1 lg:p-1 text-[10px] lg:text-xs truncate rounded ${genreColor}`}
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
            </div>

            {selectedDate && (
                <div
                    id="event-list"
                    className="p-4 mt-4 border-t border-gray-700"
                >
                    <h3 className="mb-4 text-lg font-semibold text-white">
                        {format(selectedDate, "yyyy년 MM월 dd일", {
                            locale: ko,
                        })}{" "}
                        이벤트
                    </h3>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {getEventsForDay(selectedDate).map(event => (
                            <div
                                key={event.id}
                                onClick={() => onEventSelect(event)}
                                className="p-4 transition-colors bg-gray-700 bg-opacity-50 rounded-lg shadow cursor-pointer lg:hover:bg-gray-600 active:bg-indigo-900"
                            >
                                <div className="flex items-center space-x-4">
                                    {event.img_url ? (
                                        <img
                                            src={event.img_url.replace(
                                                /(name=)[^&]*/,
                                                "$1small"
                                            )}
                                            alt={event.event_name}
                                            className="flex-shrink-0 object-cover w-24 h-32 rounded-lg"
                                        />
                                    ) : (
                                        <img
                                            src="./dummy.svg"
                                            alt="Dummy"
                                            className="flex-shrink-0 object-cover w-24 h-32 rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="mb-2 text-sm text-gray-300">
                                            {formatDate(
                                                event.schedule,
                                                event.time_start
                                            )}
                                        </p>
                                        <h3 className="mb-2 text-base font-medium text-white truncate">
                                            {event.event_name}
                                        </h3>
                                        <div className="mb-2">
                                            <GenreTag genre={event.genre} />
                                        </div>
                                        <div className="">
                                            <LocationLink
                                                location={event.location}
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {getEventsForDay(selectedDate).length === 0 && (
                            <div className="p-8 text-center rounded-lg col-span-full">
                                <p className="text-lg text-gray-300">
                                    등록된 이벤트 정보가 없습니다.
                                </p>
                                <p className="text-gray-400">
                                    (이벤트가 있다면 아래의 버튼을 눌러
                                    제보해주세요.)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCalendar;
