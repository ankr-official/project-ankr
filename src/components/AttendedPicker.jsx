import { useState, useMemo } from "react";
import { ref, set } from "firebase/database";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { database } from "../config/firebase";
import { formatDate, sortByDateTime } from "../utils/dateUtils";
import { GenreTag } from "./common/GenreTag";

const QUARTERS = [
  { key: "all", label: "전체" },
  { key: "Q1", label: "1분기" },
  { key: "Q2", label: "2분기" },
  { key: "Q3", label: "3분기" },
  { key: "Q4", label: "4분기" },
];

const getQuarter = (dateStr) => {
  const month = new Date(dateStr).getMonth(); // 0~11
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

export function AttendedPicker({ user, allEvents, likes, onClose }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const pastEvents = useMemo(
    () =>
      (allEvents || [])
        .filter((e) => new Date(e.schedule) < today)
        .sort((a, b) => sortByDateTime(a, b, true)),
    [allEvents, today],
  );

  const availableYears = useMemo(() => {
    const years = [...new Set(pastEvents.map((e) => new Date(e.schedule).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [pastEvents]);

  const currentYear = new Date().getFullYear();
  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : availableYears[0] ?? currentYear;

  const [keyword, setKeyword] = useState("");
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  const activeQuarters = useMemo(() => {
    const quarters = new Set(
      pastEvents
        .filter((e) => new Date(e.schedule).getFullYear() === selectedYear)
        .map((e) => getQuarter(e.schedule)),
    );
    return quarters;
  }, [pastEvents, selectedYear]);

  const attendedIds = useMemo(() => {
    if (!likes) return new Set();
    return new Set(
      Object.entries(likes)
        .filter(([, v]) => v === "attended")
        .map(([k]) => k),
    );
  }, [likes]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (q) {
      return pastEvents.filter(
        (e) =>
          e.event_name?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q),
      );
    }
    return pastEvents.filter((e) => {
      const year = new Date(e.schedule).getFullYear();
      if (year !== selectedYear) return false;
      if (selectedQuarter !== "all" && getQuarter(e.schedule) !== selectedQuarter)
        return false;
      return true;
    });
  }, [pastEvents, keyword, selectedYear, selectedQuarter]);

  const toggle = async (eventId) => {
    const value = attendedIds.has(eventId) ? null : "attended";
    await set(ref(database, `likes/${user.uid}/${eventId}`), value);
  };

  const isSearching = keyword.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            다녀온 행사 추가
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="행사명, 장소 검색..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Year + Quarter filters (hidden while searching) */}
        {!isSearching && (
          <div className="px-4 pt-3 pb-2 space-y-2 border-b border-gray-100 dark:border-gray-800">
            {/* Year */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setSelectedQuarter("all");
                  }}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {year}년
                </button>
              ))}
            </div>
            {/* Quarter */}
            <div className="flex gap-1.5">
              {QUARTERS.map(({ key, label }) => {
                const disabled = key !== "all" && !activeQuarters.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => !disabled && setSelectedQuarter(key)}
                    disabled={disabled}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      disabled
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : selectedQuarter === key
                          ? "bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {filtered.map((event) => {
            const isAttended = attendedIds.has(event.id);
            return (
              <button
                key={event.id}
                onClick={() => toggle(event.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  isAttended
                    ? "bg-indigo-50 dark:bg-indigo-950/40"
                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <img
                  src={
                    event.img_url
                      ? event.img_url.replace(/(name=)[^&]*/, "$1small")
                      : "./dummy.svg"
                  }
                  alt={event.event_name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(event.schedule)}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.event_name}
                  </p>
                  <GenreTag genre={event.genre} />
                </div>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isAttended
                      ? "bg-indigo-600"
                      : "border-2 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isAttended ? (
                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <PlusIcon className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-8">
              {isSearching ? "검색 결과가 없습니다." : "해당 기간에 행사가 없습니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
