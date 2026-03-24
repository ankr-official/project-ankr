import { GENRE_COLORS } from "../../constants";
import { toArray, sortGenres } from "../../utils/eventFormUtils";
import { formatScheduleDisplay } from "../../utils/adminUtils";

export default function AdminEventsTab({
  filteredEvents,
  dataLoading,
  search,
  onClearSearch,
  onEdit,
  onDelete,
  onToggleConfirm,
}) {
  if (dataLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center space-y-2">
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {search ? `"${search}" 검색 결과가 없습니다.` : "이벤트가 없습니다."}
        </p>
        {search && (
          <button
            onClick={onClearSearch}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            검색 초기화
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop Table (lg+) ── */}
      <div className="hidden lg:block rounded-2xl border border-gray-200/70 dark:border-gray-900/50 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200/70 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900">
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-24">
                ID
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-36">
                날짜
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                이벤트명
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-40">
                장소
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                장르
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-20">
                확정
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-24">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
            {filteredEvents.map((event) => (
              <tr
                key={event.id}
                onClick={() => onEdit(event)}
                className="group hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs font-mono">
                  {event.id}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                  {formatScheduleDisplay(event.schedule)}
                </td>
                <td className="px-4 py-3 text-gray-900 text-left dark:text-white font-medium max-w-[220px] truncate">
                  {event.event_name || "-"}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate text-xs">
                  {event.location || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {sortGenres(toArray(event.genre))
                      .slice(0, 3)
                      .map((g) => (
                        <span
                          key={g}
                          className={`inline-block px-1.5 py-0.5 rounded text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                        >
                          {g}
                        </span>
                      ))}
                    {toArray(event.genre).length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{toArray(event.genre).length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => onToggleConfirm(event, e)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                        event.confirm ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      title={event.confirm ? "표출 중 (클릭하여 미표출)" : "미표출 (클릭하여 표출)"}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          event.confirm ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(event);
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event);
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List (< lg) ── */}
      <div className="lg:hidden space-y-3">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => onEdit(event)}
            className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3 shadow-sm cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 text-left border-b dark:border-gray-700 pb-2 mb-2 dark:text-gray-500 mt-0.5 font-mono">
                  {event.id}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm text-left leading-snug line-clamp-2">
                  {event.event_name || "(이름 없음)"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-left">
                  {formatScheduleDisplay(event.schedule)}
                </p>
              </div>
              <div
                className="shrink-0 flex items-center gap-1.5"
                onClick={(e) => onToggleConfirm(event, e)}
              >
                <span
                  className={`text-xs font-medium ${event.confirm ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
                ></span>
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                    event.confirm ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      event.confirm ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>

            {event.location && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.location}
              </p>
            )}

            {toArray(event.genre).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {sortGenres(toArray(event.genre)).map((g) => (
                  <span
                    key={g}
                    className={`inline-block px-2 py-0.5 rounded-md text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                수정
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
