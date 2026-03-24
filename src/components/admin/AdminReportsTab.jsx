import { GENRE_COLORS } from "../../constants";
import { toArray, isoToTime, sortGenres } from "../../utils/eventFormUtils";
import { formatScheduleDisplay } from "../../utils/adminUtils";

export default function AdminReportsTab({ reports, reportsLoading, onApprove, onReject }) {
  if (reportsLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center space-y-2">
        <p className="text-gray-500 dark:text-gray-400 font-medium">접수된 제보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .map((report) => (
          <div
            key={report.id}
            className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm text-left leading-snug">
                  {report.event_name || "(이름 없음)"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatScheduleDisplay(report.schedule)}{" "}
                  {report.location && `· ${report.location}`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {report.submittedAt
                  ? new Date(report.submittedAt).toLocaleDateString("ko-KR")
                  : ""}
              </span>
            </div>

            {toArray(report.genre).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {sortGenres(toArray(report.genre)).map((g) => (
                  <span
                    key={g}
                    className={`inline-block px-2 py-0.5 rounded-md text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {(report.time_start || report.time_entrance || report.time_end) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {[
                  report.time_start && `시작 ${isoToTime(report.time_start)}`,
                  report.time_entrance && `입장 ${isoToTime(report.time_entrance)}`,
                  report.time_end && `종료 ${isoToTime(report.time_end)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            {report.event_url && (
              <a
                href={report.event_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline truncate block text-left"
              >
                {report.event_url}
              </a>
            )}

            {report.etc && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                {report.etc}
              </p>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-left">
              제보자: {report.submittedBy}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onApprove(report)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                승인
              </button>
              <button
                onClick={() => onReject(report)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                거절
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
