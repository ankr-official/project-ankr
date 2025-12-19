import { useEffect, useState } from "react";

export function YearEndReceiptView({
  year,
  events,
  onEventToggle,
  userName,
  onUserNameChange,
}) {
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
    <div className="flex justify-center">
      <div
        id="year-end-receipt-target"
        className="w-full min-w-[600px] max-w-[600px] bg-[radial-gradient(circle_at_top,_#f7f4e8_0,_#e5dcc7_50%,_#d2c6aa_100%)] text-black px-4 py-4 sm:px-6 sm:py-6 shadow-2xl border border-gray-400"
        style={{
          fontFamily:
            '"DM Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {/* Title */}
        <div className="mb-6 text-center">
          <div className="text-xs tracking-[0.3em] text-gray-700 mb-1">
            PRESENTED BY ANKR
          </div>
          <div className="text-2xl font-bold tracking-[0.25em]">
            2025 DJ EVENT RECEIPT
          </div>
        </div>

        {/* Meta info */}
        <div className="flex justify-between items-center mb-4 text-xs">
          <span>YEAR: {year}</span>
          <div className="flex gap-2 items-center">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent  text-[11px] px-1 pb-[1px] outline-none text-right"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                backgroundColor: "transparent",
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%23333' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 2px center",
                backgroundSize: "10px 6px",
                paddingRight: "16px",
              }}
            >
              <option className="text-black bg-white" value="Listener">
                Listener
              </option>
              <option className="text-black bg-white" value="Otagei">
                Otagei
              </option>
              <option className="text-black bg-white" value="DJ">
                DJ
              </option>
              <option className="text-black bg-white" value="VJ">
                VJ
              </option>
              <option className="text-black bg-white" value="Organizer">
                Organizer
              </option>
            </select>
            <input
              type="text"
              name="receipt-user-name"
              value={userName}
              onChange={(e) => onUserNameChange?.(e.target.value)}
              placeholder="YOUR NAME"
              className="bg-transparent border-b border-gray-500 text-[11px] px-1 pb-[1px] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Dotted divider */}
        <div className="my-2 border-t border-gray-500 border-dashed" />

        {/* Header row */}
        <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-2">
          <span className="w-1/5">DATE</span>
          <span className="w-3/5">EVENT</span>
          <span className="w-1/5 text-right sm:text-left">PLACE</span>
        </div>

        <div className="mb-3 border-t border-gray-500 border-dashed" />

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
                className="flex justify-between items-center w-full text-left bg-transparent cursor-pointer hover:text-red-500"
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
        <div className="my-4 border-t border-gray-500 border-dashed" />

        {/* Summary */}
        <div className="flex justify-between mb-2 text-xs">
          <span>TOTAL EVENTS</span>
          <span>{events.length}</span>
        </div>

        <div className="my-4 border-t border-gray-500 border-dashed" />

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
