import { useState, useEffect } from "react";
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
import ReportEventModal from "../components/ReportEventModal";

// Hooks
import { useFirebaseData } from "../hooks/useFirebaseData";
import { useUserSettings } from "../hooks/useUserSettings";
import { useEventData } from "../hooks/useEventData";
import { useModalNavigation } from "../hooks/useModalNavigation";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  // Data and loading state
  const { data, loading } = useFirebaseData();

  // Auth
  const { isLoggedIn, user, role } = useAuth();

  // User settings (localStorage)
  const { selectedGenres, viewMode, setViewMode, handleGenreChange } =
    useUserSettings();

  // Modal and navigation
  const { selectedItem, handleModalOpen, handleModalClose } =
    useModalNavigation(data);

  // Processed event data
  const { currentEvents, pastEvents, thisWeeksEvents } = useEventData(
    data,
    selectedGenres,
    true // showConfirmed
  );

  // Local state
  const [activeTab, setActiveTab] = useState("current");
  const [visiblePastEvents, setVisiblePastEvents] = useState(15);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const DAILY_LIMIT = 10;
  const [reportCount, setReportCount] = useState(0);
  const isLimitReached = role !== "admin" && reportCount >= DAILY_LIMIT;

  useEffect(() => {
    if (!user?.uid || role === "admin") return;
    const today = new Date().toISOString().slice(0, 10);
    get(ref(database, `reportLimits/${user.uid}`)).then((snap) => {
      const data = snap.val();
      setReportCount(data?.date === today ? (data.count ?? 0) : 0);
    }).catch(() => setReportCount(0));
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
      await set(ref(database, `reportLimits/${user.uid}`), { date: today, count: newCount });
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

  const loadMorePastEvents = () => {
    setVisiblePastEvents((prev) => prev + 15);
  };

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

  const locationSuggestions = [...new Set(data.map((e) => e.location).filter(Boolean))];
  const eventNameSuggestions = [...new Set(data.map((e) => e.event_name).filter(Boolean))];

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
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={[...currentEvents, ...pastEvents]}
        onEventSelect={handleModalOpen}
      />

      <div className="container flex-grow px-2 py-6 mx-auto lg:px-4">
        {/* Header */}
        <Header onSearchOpen={() => setIsSearchOpen(true)} />

        {/* Year-End Receipt Entry Banner (non-sticky, part of normal content) */}
        {/* <YearEndReceiptBanner /> */}

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
            className={`flex flex-col justify-between lg:mb-0 lg:items-end ${
              viewMode === "calendar" ? "justify-end" : "lg:flex-row-reverse"
            }`}
          >
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {/* Tab Buttons (Hidden in calendar mode) */}
            <div
              className={`flex space-x-2 mb-0 ${
                viewMode === "calendar" ? "hidden" : ""
              }`}
            >
              <TabButton
                isActive={activeTab === "current"}
                onClick={() => setActiveTab("current")}
              >
                예정된 이벤트
              </TabButton>
              <TabButton
                isActive={activeTab === "past"}
                onClick={() => setActiveTab("past")}
              >
                종료된 이벤트
              </TabButton>
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
                    events={pastEvents.slice(0, visiblePastEvents)}
                    className="opacity-70"
                    onEventSelect={handleModalOpen}
                    selectedGenres={selectedGenres}
                    onGenreChange={handleGenreChange}
                  />
                  {visiblePastEvents < pastEvents.length && (
                    <button
                      onClick={loadMorePastEvents}
                      className="px-4 py-2 mt-4 w-full text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      더보기
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
