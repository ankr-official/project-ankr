import { useMemo, useState } from "react";

export function EventSelection({ events, selectedIds, onToggle, onClear }) {
  if (!events?.length) {
    return (
      <div className="p-4 text-sm text-gray-400 border border-dashed border-gray-600">
        참여한 이벤트 데이터가 아직 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  const [keyword, setKeyword] = useState("");
  const [quarter, setQuarter] = useState("all"); // all | Q1 | Q2 | Q3 | Q4

  const filteredEvents = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    const byQuarter = events.filter((event) => {
      if (quarter === "all") return true;
      const date = event.scheduleDate || new Date(event.schedule);
      const month = date.getMonth(); // 0~11

      const quarterIndex =
        month <= 2 ? "Q1" : month <= 5 ? "Q2" : month <= 8 ? "Q3" : "Q4";

      return quarterIndex === quarter;
    });

    if (!q) return byQuarter;

    return byQuarter.filter((event) =>
      (event.event_name || "").toLowerCase().includes(q)
    );
  }, [events, keyword, quarter]);

  return (
    <div className="flex flex-col h-full">
      {/* Search & Clear */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="행사명 검색"
          className="flex-1 px-2 py-1 bg-black/40 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            onClear?.();
          }}
          className="px-2 py-1 font-mono border border-red-600 rounded bg-black/40 lg:hover:bg-black/70 lg:hover:text-red-400 text-gray-200 whitespace-nowrap"
        >
          리셋
        </button>
      </div>

      {/* Quarter Filter */}
      <div className="flex flex-wrap gap-2 mb-3 text-[14px]">
        {[
          { key: "all", label: "전체" },
          { key: "Q1", label: "1분기" },
          { key: "Q2", label: "2분기" },
          { key: "Q3", label: "3분기" },
          { key: "Q4", label: "4분기" },
        ].map(({ key, label }) => {
          const isActive = quarter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setQuarter(key)}
              className={`px-2 py-1 rounded border ${
                isActive
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                  : "border-gray-700 bg-black/30 text-gray-300 hover:bg-black/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-64 lg:max-h-none">
        {filteredEvents.map((event) => {
          const isChecked = selectedIds.includes(event.id);
          return (
            <label
              key={event.id}
              className="flex items-center gap-4 px-3 py-4 border border-gray-800 bg-black/40 hover:bg-black/70 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-1 accent-gray-100"
                checked={isChecked}
                onChange={() => onToggle(event.id)}
              />
              <div className="flex flex-col text-left gap-1 text-gray-100">
                <span className="font-mono text-[11px] text-gray-400">
                  {event.scheduleDate?.toLocaleDateString("ko-KR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  }) || event.schedule}
                </span>
                <span className="font-semibold">{event.event_name}</span>
              </div>
            </label>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-400">
            검색어에 해당하는 행사가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
