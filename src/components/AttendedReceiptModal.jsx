import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { YearEndReceiptView } from "./receipt/YearEndReceiptView";

export function AttendedReceiptModal({
  events,
  year,
  quarter = "all",
  onClose,
}) {
  const [userName, setUserName] = useState("");

  const processedEvents = events.map((e) => ({
    ...e,
    scheduleDate: new Date(e.schedule),
  }));

  const resolvedYear =
    year ??
    (processedEvents.length > 0
      ? new Date(processedEvents[0].schedule).getFullYear()
      : new Date().getFullYear());

  const handleDownload = async () => {
    const node = document.getElementById("year-end-receipt-target");
    if (!node) return;
    const originalTransform = node.style.transform;
    const originalTransformOrigin = node.style.transformOrigin;
    try {
      node.style.transform = "scale(1)";
      node.style.transformOrigin = "top left";
      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        width: 600,
      });
      const link = document.createElement("a");
      const suffix =
        quarter === "all" ? resolvedYear : `${resolvedYear}-${quarter}`;
      link.download = `ankr-receipt-${suffix}.png`;
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

  const canDownload = userName.trim() && processedEvents.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center mb-4 gap-3 max-w-[600px] mx-auto w-full">
          <h2 className="text-white font-semibold text-sm shrink-0">
            나의 이벤트 영수증
          </h2>
          <div className="flex-1 text-center">
            {processedEvents.length === 0 ? (
              <span className="text-sm text-red-300">이벤트가 없어요.</span>
            ) : !userName.trim() ? (
              <span className="text-sm text-red-300">이름을 입력해주세요.</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              이미지 저장
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <YearEndReceiptView
          year={resolvedYear}
          quarter={quarter}
          events={processedEvents}
          userName={userName}
          onUserNameChange={setUserName}
        />
      </div>
    </div>
  );
}
