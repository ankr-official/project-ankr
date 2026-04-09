import { useState, useEffect, useDeferredValue } from "react";
import { ref, push, get, set } from "firebase/database";
import { toast } from "react-toastify";
import { database } from "../config/firebase";

// Components
import { Modal } from "../components/Modal";
import { EventCarousel } from "../components/EventCarousel";
import { SearchModal } from "../components/SearchModal";
import EventCalendar from "../components/EventCalendar";
import { EventTable } from "../components/events/EventTable";
import { TabButton } from "../components/ui/TabButton";
import { ViewModeToggle } from "../components/ui/ViewModeToggle";
import { Header } from "../components/ui/Header";
import { ActionButtons } from "../components/ui/ActionButtons";
import { YearEndReceiptBanner } from "../components/YearEndReceiptBanner";
import { AprilFoolsBanner } from "../components/AprilFoolsBanner";
import ReportEventModal from "../components/ReportEventModal";

// Hooks
import { useYearEventData } from "../hooks/useYearEventData";
import { GENRES, toArray } from "../utils/eventFormUtils";
import { useUserSettings } from "../hooks/useUserSettings";
import { useEventData } from "../hooks/useEventData";
import { useModalNavigation } from "../hooks/useModalNavigation";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  // Data and loading state
  const {
    allData: data,
    knownYears,
    loadedYears,
    loadingYears,
    loadYear,
    loadAllYears,
    allYearsLoaded,
    loading,
  } = useYearEventData();

  // Auth
  const { isLoggedIn, user, role } = useAuth();

  // User settings (localStorage)
  const { selectedGenres, viewMode, setViewMode, handleGenreChange } =
    useUserSettings();

  // Modal and navigation
  const { selectedItem, handleModalOpen, handleModalClose } =
    useModalNavigation(data, { loadAllYears, allYearsLoaded });

  const deferredGenres = useDeferredValue(selectedGenres);

  // Processed event data
  const { currentEvents, pastEvents, thisWeeksEvents } = useEventData(
    data,
    deferredGenres,
    true, // showConfirmed
  );

  // Local state
  const [activeTab, setActiveTab] = useState("current");
  const [visiblePastYears, setVisiblePastYears] = useState(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const DAILY_LIMIT = 10;
  const [reportCount, setReportCount] = useState(0);
  const isLimitReached = role !== "admin" && reportCount >= DAILY_LIMIT;

  useEffect(() => {
    if (!user?.uid || role === "admin") return;
    const today = new Date().toISOString().slice(0, 10);
    get(ref(database, `reportLimits/${user.uid}`))
      .then((snap) => {
        const data = snap.val();
        setReportCount(data?.date === today ? (data.count ?? 0) : 0);
      })
      .catch(() => setReportCount(0));
  }, [user?.uid, role]);

  const handleReportSubmit = async (formData) => {
    if (isLimitReached) return;
    setIsSaving(true);
    try {
      await push(ref(database, "reports"), {
        ...formData,
        submittedAt: new Date().toISOString(),
        submittedBy: user?.email || user?.uid || "unknown",
      });
      const today = new Date().toISOString().slice(0, 10);
      const newCount = reportCount + 1;
      await set(ref(database, `reportLimits/${user.uid}`), {
        date: today,
        count: newCount,
      });
      setReportCount(newCount);
      setIsReportOpen(false);
      toast.success("제보가 완료되었습니다!");
    } catch (err) {
      console.error("제보 저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const THIS_YEAR = new Date().getFullYear();

  const addPastYear = (year) => {
    loadYear(year);
    setVisiblePastYears((prev) => new Set([...prev, year]));
  };

  const shownPastEvents = pastEvents.filter((e) =>
    visiblePastYears.has(new Date(e.schedule).getFullYear()),
  );

  const nextPastYear = knownYears
    .filter((y) => y < THIS_YEAR && !visiblePastYears.has(y))
    .sort((a, b) => b - a)[0];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container flex-grow px-2 py-6 mx-auto lg:px-4">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-b-2 border-indigo-700 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  const locationSuggestions = [
    ...new Set(data.map((e) => e.location).filter(Boolean)),
  ];
  const eventNameSuggestions = [
    ...new Set(data.map((e) => e.event_name).filter(Boolean)),
  ];
  const genreSuggestions = [
    ...new Set(
      data
        .flatMap((e) => toArray(e.genre))
        .filter((g) => g && !GENRES.includes(g)),
    ),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Modals */}
      {selectedItem && (
        <Modal
          isOpen={selectedItem !== null}
          onClose={handleModalClose}
          data={selectedItem || {}}
          locationSuggestions={locationSuggestions}
          eventNameSuggestions={eventNameSuggestions}
          genreSuggestions={genreSuggestions}
        />
      )}

      {isReportOpen && (
        <ReportEventModal
          onSubmit={handleReportSubmit}
          onClose={() => setIsReportOpen(false)}
          isSaving={isSaving}
          isLimitReached={isLimitReached}
          reportCount={reportCount}
          dailyLimit={DAILY_LIMIT}
          locationSuggestions={locationSuggestions}
          eventNameSuggestions={eventNameSuggestions}
          genreSuggestions={genreSuggestions}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={[...currentEvents, ...pastEvents]}
        onEventSelect={handleModalOpen}
        knownYears={knownYears}
        loadedYears={loadedYears}
        loadingYears={loadingYears}
        onYearLoad={loadYear}
      />

      <div className="container flex-grow px-2 py-6 mx-auto lg:px-4">
        {/* Header */}
        <Header onSearchOpen={() => setIsSearchOpen(true)} />

        {/* Year-End Receipt Entry Banner (non-sticky, part of normal content) */}
        {/* <YearEndReceiptBanner /> */}

        {/* April Fools Banner */}
        <AprilFoolsBanner />

        {/* This Week's Events Carousel */}
        {thisWeeksEvents.length > 0 && (
          <div className="mb-8 ">
            {/* <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors">
              가까운 이벤트
            </h2> */}
            <EventCarousel
              events={thisWeeksEvents}
              onEventClick={handleModalOpen}
            />
          </div>
        )}

        {/* Main Content */}
        <div>
          {/* Controls */}
          <div
            className={`flex flex-col justify-between lg:mb-0 lg:items-start ${
              viewMode === "calendar" ? "justify-end" : "lg:flex-row"
            }`}
          >
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {/* Tab Buttons (Hidden in calendar mode) */}
            <div
              className={`flex space-x-2 mb-4 lg:mb-0 w-full lg:w-fit ${viewMode === "calendar" ? "hidden" : ""}`}
            >
              <button
                className={`text-sm py-2  w-full lg:w-fit ${activeTab === "current" ? "bg-indigo-800" : "bg-indigo-900/50"}`}
                onClick={() => setActiveTab("current")}
              >
                예정된 이벤트
              </button>
              <button
                className={`text-sm py-2  w-full lg:w-fit ${activeTab === "past" ? "bg-indigo-800" : "bg-indigo-900/50"}`}
                onClick={() => {
                  setActiveTab("past");
                  if (visiblePastYears.size === 0) {
                    const firstYear = knownYears
                      .filter((y) => y < THIS_YEAR)
                      .sort((a, b) => b - a)[0];
                    if (firstYear) addPastYear(firstYear);
                  }
                }}
              >
                지난 이벤트
              </button>
            </div>
          </div>

          {/* Content based on view mode */}
          <div>
            {viewMode === "table" ? (
              activeTab === "current" ? (
                <EventTable
                  events={currentEvents}
                  onEventSelect={handleModalOpen}
                  selectedGenres={selectedGenres}
                  onGenreChange={handleGenreChange}
                />
              ) : (
                <div>
                  <EventTable
                    events={shownPastEvents}
                    className="opacity-70"
                    onEventSelect={handleModalOpen}
                    selectedGenres={selectedGenres}
                    onGenreChange={handleGenreChange}
                  />
                  {nextPastYear && (
                    <button
                      onClick={() => addPastYear(nextPastYear)}
                      disabled={loadingYears.has(nextPastYear)}
                      className="px-4 py-2 mt-4 w-full text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 active:bg-gray-300 mouse:hover:bg-gray-300 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {loadingYears.has(nextPastYear)
                        ? `${nextPastYear}년 불러오는 중...`
                        : `${nextPastYear}년 더보기`}
                    </button>
                  )}
                </div>
              )
            ) : (
              <EventCalendar
                events={[...currentEvents, ...pastEvents]}
                onEventSelect={handleModalOpen}
                selectedGenres={selectedGenres}
                onGenreChange={handleGenreChange}
                knownYears={knownYears}
                loadedYears={loadedYears}
                loadingYears={loadingYears}
                onYearLoad={loadYear}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onSearchOpen={() => setIsSearchOpen(true)}
          isLoggedIn={isLoggedIn}
          onReportClick={() => setIsReportOpen(true)}
        />
      </div>
    </div>
  );
}

export default Home;
