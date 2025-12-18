import { useEffect, useState } from "react";

export function YearEndReceiptView({ year, events, onEventToggle }) {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("Listener");
  const [printedDateStr, setPrintedDateStr] = useState(
    new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPrintedDateStr(
        new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex justify-center ">
      <div
        id="year-end-receipt-target"
        className="w-full min-w-[600px] max-w-[600px] bg-[radial-gradient(circle_at_top,_#f7f4e8_0,_#e5dcc7_50%,_#d2c6aa_100%)] text-black px-4 py-6 sm:px-6 sm:py-8 shadow-2xl border border-gray-400"
        style={{
          fontFamily:
            '"DM Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {/* Top perforation */}
        <div className="border-t border-dashed border-gray-500 my-4" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-xs tracking-[0.3em] text-gray-700 mb-1">
            PRESENTED BY ANKR
          </div>
          <div className="text-2xl font-bold tracking-[0.25em]">
            2025 DJ EVENT RECEIPT
          </div>
        </div>

        {/* Meta info */}
        <div className="flex justify-between items-center text-xs mb-4">
          <span>YEAR: {year}</span>
          <div className="flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent  text-[11px] px-1 pb-[1px] outline-none text-right"
            >
              <option className="bg-white text-black" value="Listener">
                Listener
              </option>
              <option className="bg-white text-black" value="Otagei">
                Otagei
              </option>
              <option className="bg-white text-black" value="DJ">
                DJ
              </option>
              <option className="bg-white text-black" value="VJ">
                VJ
              </option>
              <option className="bg-white text-black" value="VJ">
                Organizing
              </option>
            </select>
            <input
              type="text"
              name="receipt-user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="YOUR NAME"
              className="bg-transparent border-b border-gray-500 text-[11px] px-1 pb-[1px] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Dotted divider */}
        <div className="border-t border-dashed border-gray-500 my-4" />

        {/* Header row */}
        <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-2">
          <span className="w-1/5">DATE</span>
          <span className="w-3/5">EVENT</span>
          <span className="w-1/5 text-right sm:text-left">PLACE</span>
        </div>

        <div className="border-t border-dashed border-gray-500 mb-3" />

        {/* Events list */}
        <div className="space-y-1 text-xs min-h-[240px]">
          {events.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              참여한 이벤트를 선택하면 이곳에 영수증이 생성됩니다.
            </div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventToggle?.(event.id)}
                className="w-full flex justify-between items-center text-left bg-transparent hover:text-red-500 cursor-pointer"
              >
                <span className="w-1/5">
                  {event.scheduleDate?.toLocaleDateString("ko-KR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  }) || event.schedule}
                </span>
                <span className="px-2 w-3/5 truncate">{event.event_name}</span>
                <span className="px-2 w-1/5 truncate">{event.location}</span>
              </button>
            ))
          )}
        </div>

        {/* Bottom divider */}
        <div className="border-t border-dashed border-gray-500 my-4" />

        {/* Summary */}
        <div className="text-xs mb-2 flex justify-between">
          <span>TOTAL EVENTS</span>
          <span>{events.length}</span>
        </div>

        <div className="border-t border-dashed border-gray-500 my-4" />

        {/* Printed info */}
        <div className="text-[11px] text-gray-700 mt-6">
          <div className="flex justify-between">
            <span>Printed Date</span>
            <span>{printedDateStr}</span>
          </div>
          <div className="mt-8 text-center text-[10px] tracking-[0.18em] uppercase">
            © ANKR All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
