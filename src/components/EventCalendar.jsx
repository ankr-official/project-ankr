import { useState, useEffect, useRef } from "react";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAllYears, setShowAllYears] = useState(false);
  const datePickerRef = useRef(null);
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
    let active = true; // 비동기 중간에 월 전환 시 중단 방지

    const fetchHolidays = async () => {
      const year = currentDate.getFullYear();
      setIsLoading(true);
      try {
        const yearHolidays = await getHolidaysForYear(year);
        if (active) setHolidays(yearHolidays);
      } catch (error) {
        console.error("공휴일 데이터 로딩 실패:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchHolidays();
    return () => {
      active = false; // cleanup
    };
  }, [currentDate.getFullYear()]);

  // Date picker 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // 공휴일 확인 함수
  const getHoliday = (date) => {
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
  const getFilteredEvents = (dayEvents) => {
    if (selectedGenres.includes("all")) return dayEvents;

    return dayEvents.filter((event) => {
      const eventGenres = event.genre?.split(",").map((g) => g.trim()) || [];
      if (selectedGenres.length === 1) {
        return selectedGenres.some((genre) => eventGenres.includes(genre));
      }
      return selectedGenres.every((genre) => eventGenres.includes(genre));
    });
  };

  const getEventsForDay = (day) => {
    const dayEvents = events.filter((event) =>
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

  const handleDateClick = (day) => {
    setSelectedDate(day);
    // 스크롤을 이벤트 리스트로 이동
    const eventListElement = document.getElementById("event-list");
    if (eventListElement) {
      eventListElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isPastDate = (date) => {
    return isBefore(startOfDay(date), today);
  };

  const handleDatePickerToggle = () => {
    if (!showDatePicker) {
      // Date picker를 열 때 현재 달력에 표시된 년도로 설정
      setSelectedYear(currentDate.getFullYear());
      setShowAllYears(false); // 펼치기 상태 초기화
    }
    setShowDatePicker(!showDatePicker);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleYearMonthSelect = (year, month) => {
    const newDate = new Date(year, month);
    setCurrentDate(newDate);
    setShowDatePicker(false);
    setSelectedYear(year);
  };

  // 이벤트가 있는 년도 추출
  const availableYears = [
    ...new Set(events.map((event) => new Date(event.schedule).getFullYear())),
  ].sort((a, b) => b - a);

  // 최근 4년과 나머지로 분리
  const currentYear = new Date().getFullYear();
  const recentYears = availableYears.filter((year) => year >= currentYear - 2);
  const olderYears = availableYears.filter((year) => year < currentYear - 2);

  // 표시할 년도 결정
  const displayedYears = showAllYears ? availableYears : recentYears;

  // 선택된 년도에 이벤트가 있는 월 추출
  const availableMonths = [
    ...new Set(
      events
        .filter(
          (event) => new Date(event.schedule).getFullYear() === selectedYear
        )
        .map((event) => new Date(event.schedule).getMonth())
    ),
  ].sort((a, b) => b - a);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg transition-colors">
      {/* 장르 필터 */}
      <div className="top-0 z-10 p-4 mb-6 bg-gray-200 dark:bg-gray-900 rounded-lg rounded-bl-none rounded-br-none transition-colors">
        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {[
            "all",
            ...Object.keys(GENRE_COLORS).filter((genre) => genre !== "default"),
          ].map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`px-2.5 py-1.5 lg:px-3 lg:py-1 text-sm font-medium rounded-full transition-colors ${
                selectedGenres.includes(genre)
                  ? "bg-indigo-600 dark:bg-indigo-600 text-white"
                  : "bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {genre === "all" ? "전체" : genre}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 lg:p-4">
        {/* 월 이동 컨트롤 */}
        <div className="relative flex items-center justify-center gap-8 mb-4">
          <button
            onClick={prevMonth}
            className="p-3 text-lg text-gray-700 dark:text-gray-400 bg-indigo-200 dark:bg-indigo-900 lg:pl-6 lg:pr-6 lg:p-2 hover:text-gray-900 dark:hover:text-white lg:text-base transition-colors"
          >
            ←
          </button>
          <div className="flex items-center">
            <button
              onClick={handleDatePickerToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-lg font-semibold text-gray-900 dark:text-white transition-colors bg-gray-300 dark:bg-gray-800 rounded-lg lg:text-xl hover:bg-gray-400 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              {format(currentDate, "yyyy년 MM월", { locale: ko })}
              <svg
                className={`w-4 h-4 transition-transform ${showDatePicker ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isLoading && (
              <div className="w-4 h-4 ml-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            )}
          </div>
          <button
            onClick={nextMonth}
            className="p-3 text-lg text-gray-700 dark:text-gray-400 bg-indigo-200 dark:bg-indigo-900 lg:p-2 lg:pl-6 lg:pr-6 hover:text-gray-900 dark:hover:text-white lg:text-base transition-colors"
          >
            →
          </button>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <div
              ref={datePickerRef}
              className="absolute z-50 p-5 bg-white dark:bg-gray-900 border border-indigo-400 dark:border-indigo-700 rounded-lg shadow-2xl top-14 w-80 lg:w-96 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-center w-full font-semibold text-gray-900 dark:text-white transition-colors">
                  년/월 바로가기
                </h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-1 text-gray-600 dark:text-gray-400 transition-colors rounded hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-5">
                <div className="grid grid-cols-4 gap-2">
                  {displayedYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        year === selectedYear
                          ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg scale-105"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 lg:hover:text-gray-900 dark:lg:hover:text-white focus:text-gray-900 dark:focus:text-white"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                {olderYears.length > 0 && (
                  <button
                    onClick={() => setShowAllYears(!showAllYears)}
                    className="flex items-center justify-center w-full gap-2 px-3 py-2 mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-300 transition-colors rounded-lg bg-gray-200 dark:bg-gray-900 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800"
                  >
                    {showAllYears ? (
                      <>
                        <span>접기</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>이전 년도 보기 ({olderYears.length}개)</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => 11 - i).map((month) => {
                    const hasEvents = availableMonths.includes(month);
                    const isCurrentMonth =
                      month === currentDate.getMonth() &&
                      selectedYear === currentDate.getFullYear();
                    return (
                      <button
                        key={month}
                        onClick={() =>
                          hasEvents &&
                          handleYearMonthSelect(selectedYear, month)
                        }
                        disabled={!hasEvents}
                        className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          !hasEvents
                            ? "bg-gray-300 dark:bg-gray-900 text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-50"
                            : isCurrentMonth
                              ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg scale-105"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {month + 1}월
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-1 lg:mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              key={day}
              className="py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-center text-gray-600 dark:text-gray-400 transition-colors"
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
                className={`min-h-[80px] lg:min-h-[100px] p-0.5 lg:p-1 rounded cursor-pointer transition-colors ${
                  !isCurrentMonth
                    ? "bg-gray-200 dark:bg-gray-700 bg-opacity-10 dark:bg-opacity-10"
                    : isPast
                      ? "bg-gray-300 dark:bg-gray-700 bg-opacity-40 dark:bg-opacity-40"
                      : "bg-gray-300 dark:bg-gray-700 bg-opacity-80 dark:bg-opacity-80"
                } ${isToday(day) ? "ring-2 ring-indigo-500 dark:ring-indigo-500" : ""} ${
                  selectedDate && isSameDay(day, selectedDate)
                    ? "ring-2 ring-indigo-400 dark:ring-indigo-300"
                    : ""
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={`text-right text-xs lg:text-sm transition-colors ${
                      holidayList
                        ? "text-red-600 dark:text-red-400"
                        : day.getDay() === 0
                          ? "text-red-600 dark:text-red-400"
                          : day.getDay() === 6
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                    } ${!isCurrentMonth ? "opacity-50" : ""} ${isPast ? "opacity-50" : ""}`}
                  >
                    {format(day, "d")}
                  </div>
                  {holidayList && (
                    <div className="flex flex-col items-end space-y-0.5">
                      {holidayList.map((holiday, index) => (
                        <div
                          key={index}
                          className={`text-right text-[10px] lg:text-xs text-red-600 dark:text-red-400 transition-colors ${!isCurrentMonth ? "opacity-50" : ""}`}
                        >
                          {holiday}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className={`mt-0.5 lg:mt-1 space-y-1 ${!isCurrentMonth || isPast ? "opacity-50" : ""}`}
                >
                  {dayEvents.map((event) => {
                    const firstGenre = event.genre?.split(",")[0]?.trim();
                    const genreColor =
                      GENRE_COLORS[firstGenre] || GENRE_COLORS.default;

                    return (
                      <div
                        key={event.id}
                        className={`p-0.5 pt-1 lg:p-1 text-[10px] lg:text-xs truncate rounded ${genreColor} transition-colors`}
                      >
                        <div className="font-medium truncate">
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
        <div id="event-list" className="p-4 mt-4 border-t border-gray-300 dark:border-gray-700 transition-colors">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white transition-colors">
            {format(selectedDate, "yyyy년 MM월 dd일", {
              locale: ko,
            })}{" "}
            이벤트
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {getEventsForDay(selectedDate).map((event) => (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                className="p-4 transition-colors bg-gray-200 dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 rounded-lg shadow cursor-pointer lg:hover:bg-gray-300 dark:lg:hover:bg-gray-600 active:bg-indigo-200 dark:active:bg-indigo-900"
              >
                <div className="flex items-center space-x-4">
                  {event.img_url ? (
                    <img
                      src={event.img_url.replace(/(name=)[^&]*/, "$1small")}
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
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                      {formatDate(event.schedule, event.time_start)}
                    </p>
                    <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white truncate transition-colors">
                      {event.event_name}
                    </h3>
                    <div className="mb-2">
                      <GenreTag genre={event.genre} />
                    </div>
                    <div className="">
                      <LocationLink
                        location={event.location}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getEventsForDay(selectedDate).length === 0 && (
              <div className="p-8 text-center rounded-lg col-span-full">
                <p className="text-lg text-gray-700 dark:text-gray-300 transition-colors">
                  등록된 이벤트 정보가 없습니다.
                </p>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">
                  (이벤트가 있다면 아래의 버튼을 눌러 제보해주세요.)
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
