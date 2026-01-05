import { useState } from "react";

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

// Hooks
import { useFirebaseData } from "../hooks/useFirebaseData";
import { useUserSettings } from "../hooks/useUserSettings";
import { useEventData } from "../hooks/useEventData";
import { useModalNavigation } from "../hooks/useModalNavigation";

function Home() {
  // Data and loading state
  const { data, loading } = useFirebaseData();

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

  const loadMorePastEvents = () => {
    setVisiblePastEvents((prev) => prev + 15);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container flex-grow px-2 py-8 mx-auto lg:px-4">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-b-2 border-indigo-700 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Modals */}
      {selectedItem && (
        <Modal
          isOpen={selectedItem !== null}
          onClose={handleModalClose}
          data={selectedItem || {}}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={[...currentEvents, ...pastEvents]}
        onEventSelect={handleModalOpen}
      />

      <div className="container flex-grow px-2 py-8 mx-auto lg:px-4">
        {/* Header */}
        <Header onSearchOpen={() => setIsSearchOpen(true)} />

        {/* Year-End Receipt Entry Banner (non-sticky, part of normal content) */}
        <YearEndReceiptBanner />

        {/* This Week's Events Carousel */}
        {thisWeeksEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors">
              가까운 이벤트
            </h2>
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
            className={`flex flex-col-reverse lg:mb-0 lg:flex-row lg:items-end ${
              viewMode === "calendar" ? "justify-end" : "justify-between"
            }`}
          >
            {/* Tab Buttons (Hidden in calendar mode) */}
            <div
              className={`flex space-x-2 mb-4 lg:mb-0 ${
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

            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
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
        <ActionButtons onSearchOpen={() => setIsSearchOpen(true)} />
      </div>
    </div>
  );
}

export default Home;
