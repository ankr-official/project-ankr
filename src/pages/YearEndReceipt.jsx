import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFirebaseData } from "../hooks/useFirebaseData";
import { useEventData } from "../hooks/useEventData";
import { EventSelection } from "../components/receipt/EventSelection";
import { YearEndReceiptView } from "../components/receipt/YearEndReceiptView";
import * as htmlToImage from "html-to-image";

function YearEndReceiptPage() {
  const { data, loading } = useFirebaseData();
  const { currentEvents, pastEvents } = useEventData(data, ["all"], true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [userName, setUserName] = useState("");

  const currentYear = new Date().getFullYear();

  const yearEvents = useMemo(
    () =>
      [...currentEvents, ...pastEvents]
        .filter(
          (event) =>
            (event.scheduleDate || new Date(event.schedule)).getFullYear() ===
            currentYear
        )
        .sort((a, b) => {
          const dateA = a.scheduleDate || new Date(a.schedule);
          const dateB = b.scheduleDate || new Date(b.schedule);
          return dateB - dateA;
        }),
    [currentEvents, pastEvents, currentYear]
  );

  const selectedEvents = useMemo(
    () => yearEvents.filter((event) => selectedIds.includes(event.id)),
    [yearEvents, selectedIds]
  );

  const handleToggleEvent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDownloadPng = async () => {
    if (!userName.trim()) {
      return;
    }

    const node = document.getElementById("year-end-receipt-target");
    if (!node) return;

    const originalTransform = node.style.transform;
    const originalTransformOrigin = node.style.transformOrigin;

    try {
      // Ensure consistent export size regardless of on-screen scaling
      node.style.transform = "scale(1)";
      node.style.transformOrigin = "top left";

      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        width: 600,
      });

      const link = document.createElement("a");
      link.download = `ankr-year-end-receipt-${currentYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to export receipt as PNG:", error);
    } finally {
      node.style.transform = originalTransform;
      node.style.transformOrigin = originalTransformOrigin;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex min-h-screen text-gray-100">
      <div className="container px-2 py-6 mx-auto lg:px-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col-reverse gap-4 justify-center items-center mb-3 lg:flex-row">
            <h1 className="text-xl font-semibold lg:text-2xl">
              YEAR-END ANKR RECEIPT (BETA)
            </h1>
            <Link
              to="/"
              className="px-3 py-1 text-xs text-gray-200 rounded-md border border-gray-600 transition-colors lg:text-sm hover:bg-indigo-800"
            >
              홈으로
            </Link>
          </div>
          <p className="text-xs text-gray-400 lg:text-sm">
            {currentYear}년에 참여한 이벤트를 선택해 나만의 연말 영수증을 만들어
            보세요.
          </p>
        </div>

        <div className="flex flex-col gap-6 justify-center items-center lg:flex-row lg:gap-8">
          {/* Left: Selection */}
          <div>
            <div className="border border-gray-800 bg-indigo-900/50 rounded-lg p-4 lg:h-[1080px] flex flex-col">
              {loading ? (
                <div className="py-10 text-sm text-center text-gray-400">
                  이벤트 데이터를 불러오는 중입니다...
                </div>
              ) : (
                <EventSelection
                  events={yearEvents}
                  selectedIds={selectedIds}
                  onToggle={handleToggleEvent}
                  onClear={handleClearSelection}
                />
              )}
            </div>
          </div>

          {/* Right: Receipt Preview & Download */}
          <div className="mt-6 lg:mt-0">
            <div className="overflow-x-auto lg:h-[720px] flex items-start max-w-96 lg:max-w-none mb-8">
              <YearEndReceiptView
                year={currentYear}
                events={selectedEvents}
                onEventToggle={handleToggleEvent}
                userName={userName}
                onUserNameChange={setUserName}
              />
            </div>

            {/* Download button will be wired with PNG export */}
            <div className="flex justify-center mt-8 lg:mt-0">
              <button
                type="button"
                className="px-4 py-2 font-mono text-sm border border-gray-600 transition-colors bg-indigo hover:bg-gray-900"
                onClick={handleDownloadPng}
                disabled={selectedEvents.length === 0 || !userName.trim()}
              >
                {selectedEvents.length === 0
                  ? "이벤트를 먼저 선택해 주세요"
                  : !userName.trim()
                    ? "이름을 입력해 주세요"
                    : "이미지 저장"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Scroll Buttons */}
      <div className="flex fixed right-4 bottom-6 z-50 flex-col gap-3 lg:hidden">
        <button
          type="button"
          onClick={scrollToTop}
          className="p-3 text-white bg-gray-700 rounded-full shadow-lg transition-colors focus:bg-indigo-700 active:bg-indigo-800"
          aria-label="맨 위로"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          className="p-3 text-white bg-gray-700 rounded-full shadow-lg transition-colors focus:bg-indigo-700 active:bg-indigo-800"
          aria-label="맨 아래로"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default YearEndReceiptPage;
