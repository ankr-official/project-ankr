import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import {
  ArrowLeftIcon,
  HeartIcon,
  CheckCircleIcon,
  PlusIcon,
  TicketIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { database } from "../config/firebase";
import { sortByDateTime } from "../utils/dateUtils";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { EventCard } from "../components/events/EventCard";
import { AttendedPicker } from "../components/AttendedPicker";
import { AttendedReceiptModal } from "../components/AttendedReceiptModal";

const TABS = [
  { key: "liked", label: "관심 행사", icon: HeartIcon },
  { key: "attended", label: "다녀온 행사", icon: CheckCircleIcon },
];

const QUARTERS = [
  { key: "all", label: "전체" },
  { key: "Q1", label: "1분기" },
  { key: "Q2", label: "2분기" },
  { key: "Q3", label: "3분기" },
  { key: "Q4", label: "4분기" },
];

const getQuarter = (dateStr) => {
  const month = new Date(dateStr).getMonth();
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

const isPast = (schedule) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(schedule) < today;
};

export default function LikedEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allEvents } = useRealtimeData("data_v2");
  const [likes, setLikes] = useState(null);
  const [activeTab, setActiveTab] = useState("liked");
  const [showPicker, setShowPicker] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(`dismissedBanners`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const dismiss = (eventId) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(eventId);
      localStorage.setItem(`dismissedBanners`, JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onValue(ref(database, `likes/${user.uid}`), (snap) => {
      setLikes(snap.val() || {});
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const reclassify = async (eventId) => {
    await set(ref(database, `likes/${user.uid}/${eventId}`), "attended");
  };

  const reclassifyToLiked = async (eventId) => {
    await set(ref(database, `likes/${user.uid}/${eventId}`), "liked");
  };

  const getEventsForTab = (tab) => {
    if (!allEvents || !likes) return [];
    const ids = Object.entries(likes)
      .filter(([, v]) =>
        tab === "liked" ? v === "liked" || v === true : v === tab,
      )
      .map(([k]) => k);
    return allEvents
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => sortByDateTime(a, b, tab !== "liked"));
  };

  const attendedEvents = useMemo(
    () => getEventsForTab("attended"),
    [allEvents, likes],
  );

  const availableYears = useMemo(() => {
    const years = [
      ...new Set(attendedEvents.map((e) => new Date(e.schedule).getFullYear())),
    ];
    return years.sort((a, b) => b - a);
  }, [attendedEvents]);

  const effectiveYear = selectedYear ?? availableYears[0] ?? null;

  const activeQuarters = useMemo(() => {
    if (!effectiveYear) return new Set();
    return new Set(
      attendedEvents
        .filter((e) => new Date(e.schedule).getFullYear() === effectiveYear)
        .map((e) => getQuarter(e.schedule)),
    );
  }, [attendedEvents, effectiveYear]);

  const filteredAttendedEvents = useMemo(() => {
    return attendedEvents.filter((e) => {
      if (effectiveYear && new Date(e.schedule).getFullYear() !== effectiveYear)
        return false;
      if (
        selectedQuarter !== "all" &&
        getQuarter(e.schedule) !== selectedQuarter
      )
        return false;
      return true;
    });
  }, [attendedEvents, effectiveYear, selectedQuarter]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedQuarter("all");
  };

  const loading = likes === null || !allEvents;

  return (
    <>
      {showPicker && (
        <AttendedPicker
          user={user}
          allEvents={allEvents}
          likes={likes}
          onClose={() => setShowPicker(false)}
        />
      )}
      {showReceipt && (
        <AttendedReceiptModal
          events={filteredAttendedEvents}
          year={effectiveYear}
          quarter={selectedQuarter}
          onClose={() => setShowReceipt(false)}
        />
      )}
      <div className="min-h-screen bg-indigo-50/50 dark:bg-[#242424] transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              관심 행사
            </h1>
          </div>

          {/* Tab row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-none font-medium border-b-2 -mb-px transition-colors duration-200 active:outline-none ${
                    activeTab === key
                      ? "text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400 focus:outline-none"
                      : "text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {activeTab === "attended" && (
              <div className="flex items-center justify-end gap-2 sm:ml-auto">
                {attendedEvents.length > 0 && (
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 active:bg-indigo-100 mouse:hover:bg-indigo-100 dark:active:bg-indigo-900/40 dark:mouse:hover:bg-indigo-900/40 transition-colors w-full sm:w-fit justify-center"
                  >
                    <TicketIcon className="w-4 h-4" />
                    영수증 발급
                  </button>
                )}
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 active:bg-indigo-100 mouse:hover:bg-indigo-100 dark:active:bg-indigo-900/40 dark:mouse:hover:bg-indigo-900/40 transition-colors w-full sm:w-fit justify-center"
                >
                  <PlusIcon className="w-4 h-4" />
                  행사 추가
                </button>
              </div>
            )}
          </div>

          {/* Year + Quarter filter (attended tab only) */}
          {activeTab === "attended" && availableYears.length > 0 && (
            <div className="flex flex-col gap-2 mb-2 p-3 rounded-lg bg-gray-300/50 dark:bg-gray-900 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      effectiveYear === year
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700"
                    }`}
                  >
                    {year}년
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
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
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
              불러오는 중...
            </div>
          ) : activeTab === "attended" ? (
            filteredAttendedEvents.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
                다녀온 행사로 등록한 행사가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttendedEvents.map((event) => (
                  <div key={event.id}>
                    <div className="relative">
                      <EventCard
                        event={event}
                        onEventSelect={() => {}}
                        showHeart={false}
                        className="p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow transition-colors"
                      />
                      {/* 자세히 보기 - 데스크탑 absolute */}
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="hidden sm:flex absolute bottom-2 right-2 z-10 items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                      >
                        자세히 보기
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reclassifyToLiked(event.id)}
                        className="absolute top-2 right-2 z-20 group p-0"
                        aria-label="관심 행사로 이동"
                      >
                        <CheckCircleSolid className="w-6 h-6 text-indigo-500 lg:group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    {/* 자세히 보기 - 모바일 행 */}
                    <div className="flex sm:hidden justify-end items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                      >
                        자세히 보기
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            (() => {
              const likedEvents = getEventsForTab("liked");
              const upcomingLiked = likedEvents.filter(
                (e) => !isPast(e.schedule),
              );
              const pastLiked = likedEvents.filter((e) => isPast(e.schedule));

              if (likedEvents.length === 0) {
                return (
                  <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
                    관심 행사로 등록한 행사가 없습니다.
                  </div>
                );
              }

              const renderLikedCard = (event) => {
                const hasBanner =
                  isPast(event.schedule) && !dismissed.has(event.id);
                const hasDismissed =
                  isPast(event.schedule) && dismissed.has(event.id);
                return (
                  <div key={event.id}>
                    <div className="relative">
                      <EventCard
                        event={event}
                        onEventSelect={() => {}}
                        showHeart
                        className={`p-4 bg-gray-100 dark:bg-gray-800 shadow transition-colors ${
                          hasBanner
                            ? "rounded-t-lg"
                            : "rounded-t-lg sm:rounded-lg"
                        }`}
                      />
                      {/* 자세히 보기 - 데스크탑 absolute */}
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="hidden sm:flex absolute bottom-2 right-2 z-10 items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                      >
                        자세히 보기
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                      {hasDismissed && (
                        <button
                          onClick={() => {
                            setDismissed((prev) => {
                              const next = new Set(prev);
                              next.delete(event.id);
                              localStorage.setItem(
                                `dismissedBanners`,
                                JSON.stringify([...next]),
                              );
                              return next;
                            });
                          }}
                          className="absolute -bottom-12 sm:bottom-2 left-1/2 -translate-x-1/2 z-10 text-gray-400 dark:text-gray-600 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
                          aria-label="알림 다시 보기"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* 자세히 보기 - 모바일 행 (배너 없을 때) */}
                    {!hasBanner && (
                      <div className="flex sm:hidden justify-end items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                        >
                          자세히 보기
                          <ChevronRightIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {hasBanner && (
                      <div className="rounded-b-lg bg-gray-50 dark:bg-gray-800/60">
                        {/* 모바일: 자세히 보기 행 */}
                        <div className="flex sm:hidden justify-end items-center px-4 pt-2">
                          <button
                            onClick={() => navigate(`/event/${event.id}`)}
                            className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                          >
                            자세히 보기
                            <ChevronRightIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            이미 지난 행사예요. 다녀오셨나요?
                          </span>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => dismiss(event.id)}
                              className="text-xs text-gray-400 dark:text-indigo-500 active:text-indigo-800 mouse:hover:text-indigo-800 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
                            >
                              알림 숨기기
                            </button>
                            <button
                              onClick={() => reclassify(event.id)}
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 active:text-indigo-800 mouse:hover:text-indigo-800 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 underline underline-offset-2 transition-colors"
                            >
                              다녀온 행사로 이동
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="space-y-6">
                  {upcomingLiked.length > 0 && (
                    <div>
                      <p className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 my-4 mb-2 px-2">
                        다가오는 행사
                      </p>
                      <div className="space-y-3">
                        {upcomingLiked.map(renderLikedCard)}
                      </div>
                    </div>
                  )}
                  {pastLiked.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between my-4 mb-2 px-2">
                        <p className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          지난 행사
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              pastLiked.forEach((e) => dismiss(e.id))
                            }
                            className="text-xs text-gray-400 dark:text-gray-500 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-300 dark:mouse:hover:text-gray-300 transition-colors"
                          >
                            모든 알림 숨기기
                          </button>
                          {/* <button
                            onClick={() =>
                              pastLiked.forEach((e) => reclassify(e.id))
                            }
                            className="text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                          >
                            모두 다녀온 행사로 이동
                          </button> */}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {pastLiked.map(renderLikedCard)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </>
  );
}
