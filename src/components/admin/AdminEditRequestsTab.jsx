import { useEffect } from "react";
import { ref, remove, update } from "firebase/database";
import { toast } from "react-toastify";
import { database } from "../../config/firebase";
import { useRealtimeData } from "../../hooks/useRealtimeData";
import { GENRE_COLORS } from "../../constants";
import { getChangedFields } from "../../utils/adminUtils";

export default function AdminEditRequestsTab({ events, onCountChange }) {
  const { data: editRequests, loading: editRequestsLoading } = useRealtimeData("editRequests");

  useEffect(() => {
    onCountChange?.(editRequests.length);
  }, [editRequests.length]);

  const handleApprove = async (request) => {
    try {
      if (request.deleteRequest) {
        await remove(ref(database, `data_v2/${request.eventId}`));
        await remove(ref(database, `editRequests/${request.id}`));
        toast.success("삭제 요청이 승인되어 이벤트가 삭제되었습니다.");
      } else {
        const {
          id,
          eventId,
          eventName,
          reason,
          submittedAt,
          submittedBy,
          _snap,
          ...data
        } = request;
        await update(ref(database, `data_v2/${eventId}`), data);
        await remove(ref(database, `editRequests/${id}`));
        toast.success("요청이 승인되어 이벤트 정보가 업데이트되었습니다.");
      }
    } catch {
      toast.error("승인 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (request) => {
    try {
      await remove(ref(database, `editRequests/${request.id}`));
      toast.success("요청이 거절되었습니다.");
    } catch {
      toast.error("거절 중 오류가 발생했습니다.");
    }
  };

  if (editRequestsLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (editRequests.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center space-y-2">
        <p className="text-gray-500 dark:text-gray-400 font-medium">접수된 요청이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {editRequests
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .map((request) => (
          <div
            key={request.id}
            className={`rounded-2xl border bg-white dark:bg-gray-900 p-4 shadow-sm space-y-3 ${
              request.deleteRequest
                ? "border-red-200/70 dark:border-red-800/40"
                : "border-amber-200/70 dark:border-amber-800/40"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      request.deleteRequest
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                        : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {request.deleteRequest ? "삭제요청" : "수정요청"}
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm text-left leading-snug">
                    {request.eventName || request.event_name || "(이름 없음)"}
                  </p>
                  <p className="text-xs text-gray-400 text-left dark:text-gray-500 mt-0.5 font-mono">
                    ID: {request.eventId}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {request.submittedAt
                  ? new Date(request.submittedAt).toLocaleDateString("ko-KR")
                  : ""}
              </span>
            </div>

            {/* 수정 사유 */}
            {request.reason && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 px-3 py-2">
                <p className="text-xs font-medium text-left text-amber-700 dark:text-amber-400 mb-0.5">
                  수정 사유
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-left">
                  {request.reason}
                </p>
              </div>
            )}

            {/* 수정/삭제 내용 */}
            {(() => {
              if (request.deleteRequest) {
                return (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 px-3 py-2">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 text-left">
                      이벤트 삭제 요청
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-left">
                      승인 시 이 이벤트가 영구 삭제됩니다.
                    </p>
                  </div>
                );
              }
              const original = events.find((e) => e.id === request.eventId);
              const diffs = getChangedFields(original, request);
              return (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/50 px-3 py-2 space-y-2">
                  <p className="text-xs font-medium text-left text-gray-500 dark:text-gray-400">
                    변경 항목
                    {diffs !== null && (
                      <span className="ml-1.5 text-indigo-500 dark:text-indigo-400">
                        {diffs.length}개
                      </span>
                    )}
                  </p>
                  {diffs === null ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      원본 이벤트를 찾을 수 없습니다. (ID: {request.eventId})
                    </p>
                  ) : diffs.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      원본과 동일한 내용입니다.
                    </p>
                  ) : (
                    diffs.map(({ label, from, to, isGenre, isUrl }) => (
                      <div key={label} className="text-xs text-left space-y-0.5">
                        <span className="text-gray-400 dark:text-gray-500 font-medium">
                          {label}
                        </span>
                        <div className="flex items-start gap-1.5 flex-wrap pl-1">
                          {isGenre ? (
                            <>
                              <div className="flex flex-wrap gap-1 line-through opacity-50">
                                {from.map((g) => (
                                  <span
                                    key={g}
                                    className={`inline-block px-1.5 py-0.5 rounded text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                              <span className="text-gray-400 dark:text-gray-500 self-center">→</span>
                              <div className="flex flex-wrap gap-1">
                                {to.map((g) => (
                                  <span
                                    key={g}
                                    className={`inline-block px-1.5 py-0.5 rounded text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 dark:text-gray-500 line-through">
                                {from}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">→</span>
                              {isUrl ? (
                                <a
                                  href={to}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-500 dark:text-indigo-400 hover:underline truncate"
                                >
                                  {to}
                                </a>
                              ) : (
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {to}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-left">
              요청자: {request.submittedBy}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleApprove(request)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors ${
                  request.deleteRequest
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {request.deleteRequest ? "승인 (삭제)" : "승인 (덮어쓰기)"}
              </button>
              <button
                onClick={() => handleReject(request)}
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
