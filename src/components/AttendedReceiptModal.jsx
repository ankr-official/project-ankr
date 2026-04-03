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
  const [isExporting, setIsExporting] = useState(false);

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
    const hiddenRows = node.querySelectorAll('[data-receipt-hidden="true"]');
    const hiddenCount = node.querySelector("[data-receipt-hidden-count]");
    const select = node.querySelector("select");
    const input = node.querySelector("input[name='receipt-user-name']");
    let selectPlaceholder = null;
    let inputPlaceholder = null;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      node.style.transform = "scale(1)";
      node.style.transformOrigin = "top left";
      hiddenRows.forEach((el) => (el.style.display = "none"));
      if (hiddenCount) hiddenCount.style.display = "none";
      if (select) {
        selectPlaceholder = document.createElement("span");
        selectPlaceholder.textContent = select.value;
        selectPlaceholder.style.cssText = `font-size:11px; padding-right:16px;`;
        select.parentNode.insertBefore(selectPlaceholder, select);
        select.style.display = "none";
      }
      if (input) {
        inputPlaceholder = document.createElement("span");
        inputPlaceholder.textContent = input.value;
        inputPlaceholder.style.cssText = `display:inline-block; width:${input.offsetWidth}px; font-size:11px; border-bottom:1px solid #6b7280; padding:0 2px 1px; text-align:left;`;
        input.parentNode.insertBefore(inputPlaceholder, input);
        input.style.display = "none";
      }
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
      hiddenRows.forEach((el) => (el.style.display = ""));
      if (hiddenCount) hiddenCount.style.display = "";
      if (select) select.style.display = "";
      selectPlaceholder?.remove();
      if (input) input.style.display = "";
      inputPlaceholder?.remove();
      setIsExporting(false);
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
          <div className="flex items-center justify-between w-full shrink-0">
            <button
              onClick={handleDownload}
              disabled={!canDownload || isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isExporting ? "저장 중..." : "이미지 저장"}
            </button>
            <div className="flex-1 text-right">
              {processedEvents.length === 0 ? (
                <span className="text-sm text-red-300">이벤트가 없어요.</span>
              ) : !userName.trim() ? (
                <span className="text-sm text-red-300">
                  이름을 입력해주세요.
                </span>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          {isExporting && (
            <div className="absolute inset-0 z-10 rounded bg-black/80 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-b-2 border-indigo-700 animate-spin" />
              <span className="text-white text-sm">저장 중...</span>
            </div>
          )}
          <YearEndReceiptView
            year={resolvedYear}
            quarter={quarter}
            events={processedEvents}
            userName={userName}
            onUserNameChange={setUserName}
          />
        </div>
      </div>
    </div>
  );
}
