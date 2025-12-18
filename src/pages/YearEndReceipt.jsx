import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFirebaseData } from "../hooks/useFirebaseData";
import { useEventData } from "../hooks/useEventData";
import { EventSelection } from "../components/receipt/EventSelection";
import { YearEndReceiptView } from "../components/receipt/YearEndReceiptView";
import * as htmlToImage from "html-to-image";

function YearEndReceiptPage() {
  const { data, loading } = useFirebaseData();
  const { pastEvents } = useEventData(data, ["all"], true);
  const [selectedIds, setSelectedIds] = useState([]);

  const currentYear = new Date().getFullYear();

  const yearEvents = useMemo(
    () =>
      pastEvents.filter(
        (event) =>
          (event.scheduleDate || new Date(event.schedule)).getFullYear() ===
          currentYear
      ),
    [pastEvents, currentYear]
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
    const node = document.getElementById("year-end-receipt-target");
    if (!node) return;

    const nameInput = node.querySelector('input[name="receipt-user-name"]');
    if (!nameInput || !nameInput.value.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }

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

  return (
    <div className="min-h-screen text-gray-100">
      <div className="container mx-auto px-2 lg:px-4 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-xl lg:text-2xl font-semibold">
              YEAR-END ANKR RECEIPT
            </h1>
            <Link
              to="/"
              className="text-xs lg:text-sm px-3 py-1 border border-gray-600 rounded-md text-gray-200 hover:bg-indigo-800 transition-colors"
            >
              홈으로
            </Link>
          </div>
          <p className="text-xs lg:text-sm text-gray-400">
            {currentYear}년에 참여한 이벤트를 선택해 나만의 연말 영수증을 만들어
            보세요.
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-6 lg:gap-8 items-start">
          {/* Left: Selection */}
          <div>
            <div className="border border-gray-800 bg-indigo-900/50 rounded-lg p-4 lg:h-[720px] flex flex-col">
              {loading ? (
                <div className="py-10 text-center text-gray-400 text-sm">
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
            <div className="border border-gray-800 px-4 overflow-x-auto lg:h-[720px] lg:overflow-y-auto flex items-center justify-center">
              <YearEndReceiptView
                year={currentYear}
                events={selectedEvents}
                onEventToggle={handleToggleEvent}
              />
            </div>

            {/* Download button will be wired with PNG export */}
            <div className="flex justify-center">
              <button
                type="button"
                className="px-4 py-2 text-sm font-mono border border-gray-600 bg-indigo hover:bg-gray-900 transition-colors"
                onClick={handleDownloadPng}
                disabled={selectedEvents.length === 0}
              >
                {selectedEvents.length === 0
                  ? "이벤트를 먼저 선택해 주세요"
                  : "이미지 저장"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YearEndReceiptPage;
