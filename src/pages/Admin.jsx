import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, remove, update, set } from "firebase/database";
import { toast } from "react-toastify";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { GENRE_COLORS } from "../constants";
import EventEditModal from "../components/admin/EventEditModal";
import ThemeToggle from "../components/ui/ThemeToggle";

const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string")
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return Object.values(val);
};

const pad = (n) => String(n).padStart(2, "0");

const isoToTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

const toLocalDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return "";
  }
};

/** Returns array of { label, from, to } for fields that differ between original event and request. */
const getChangedFields = (original, request) => {
  if (!original) return null;
  const diffs = [];

  // 이벤트명
  if ((original.event_name ?? "") !== (request.event_name ?? ""))
    diffs.push({
      label: "이벤트명",
      from: original.event_name,
      to: request.event_name,
    });

  // 날짜 (로컬 날짜만 비교)
  if (toLocalDate(original.schedule) !== toLocalDate(request.schedule))
    diffs.push({
      label: "날짜",
      from: formatScheduleDisplay(original.schedule),
      to: formatScheduleDisplay(request.schedule),
    });

  // 장소
  if ((original.location ?? "") !== (request.location ?? ""))
    diffs.push({
      label: "장소",
      from: original.location || "-",
      to: request.location || "-",
    });

  // 장르
  const origGenre = toArray(original.genre).slice().sort().join(",");
  const reqGenre = toArray(request.genre).slice().sort().join(",");
  if (origGenre !== reqGenre)
    diffs.push({
      label: "장르",
      from: toArray(original.genre),
      to: toArray(request.genre),
      isGenre: true,
    });

  // 시간
  const timeFields = [
    ["time_start", "시작"],
    ["time_entrance", "입장"],
    ["time_end", "종료"],
  ];
  timeFields.forEach(([field, timeLabel]) => {
    const origT = isoToTime(original[field]);
    const reqT = isoToTime(request[field]);
    if (origT !== reqT)
      diffs.push({
        label: `시간(${timeLabel})`,
        from: origT || "-",
        to: reqT || "-",
      });
  });

  // SNS 링크
  if ((original.event_url ?? "") !== (request.event_url ?? ""))
    diffs.push({
      label: "SNS",
      from: original.event_url || "-",
      to: request.event_url || "-",
      isUrl: true,
    });

  // 기타
  if ((original.etc ?? "") !== (request.etc ?? ""))
    diffs.push({
      label: "기타",
      from: original.etc || "-",
      to: request.etc || "-",
    });

  return diffs;
};

const formatScheduleDisplay = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
  } catch {
    return dateStr;
  }
};

export default function Admin() {
  const navigate = useNavigate();
  const { role, user, signOut, loading: authLoading } = useAuth();
  const { data: events, loading: dataLoading } = useRealtimeData("data_v2");
  const { data: reports, loading: reportsLoading } = useRealtimeData("reports");
  const { data: editRequests, loading: editRequestsLoading } = useRealtimeData("editRequests");

  // ── 모든 훅은 조건부 return 전에 선언 ──
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const now = new Date();

  const stats = useMemo(() => {
    const upcoming = events.filter(
      (e) => new Date(e.schedule) >= now && e.confirm,
    ).length;
    const past = events.filter((e) => new Date(e.schedule) < now).length;
    const unconfirmed = events.filter((e) => !e.confirm).length;
    return { total: events.length, upcoming, past, unconfirmed };
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (tab === "upcoming")
      filtered = filtered.filter((e) => new Date(e.schedule) >= now);
    else if (tab === "past")
      filtered = filtered.filter((e) => new Date(e.schedule) < now);
    else if (tab === "unconfirmed")
      filtered = filtered.filter((e) => !e.confirm);

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.event_name?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          toArray(e.genre).some((g) => g.toLowerCase().includes(q)),
      );
    }

    return filtered.sort((a, b) =>
      tab === "upcoming"
        ? new Date(a.schedule) - new Date(b.schedule)
        : new Date(b.schedule) - new Date(a.schedule),
    );
  }, [events, tab, search]);

  // ── 훅 선언 완료 후 조건부 early return ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50/50 dark:bg-[#242424]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-indigo-50/50 dark:bg-[#242424]">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <p className="text-gray-900 dark:text-white text-lg font-semibold">
            관리자 권한이 필요합니다
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            이 페이지는 관리자만 접근할 수 있습니다.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // ── 이벤트 핸들러 ──
  const handleToggleConfirm = async (event, e) => {
    e.stopPropagation();
    try {
      await update(ref(database, `data_v2/${event.id}`), {
        confirm: !event.confirm,
      });
    } catch {
      toast.error("변경 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await remove(ref(database, `data_v2/${deleteTarget.id}`));
      toast.success("이벤트가 삭제되었습니다.");
      setDeleteTarget(null);
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (eventData) => {
    const { id, ...data } = eventData;
    setIsSaving(true);
    try {
      if (id) {
        await update(ref(database, `data_v2/${id}`), data);
        toast.success("이벤트가 수정되었습니다.");
      } else {
        const maxRow = events.reduce((max, e) => {
          const match = e.id?.match(/^row(\d+)$/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        const newKey = `row${maxRow + 1}`;
        await set(ref(database, `data_v2/${newKey}`), data);
        toast.success("이벤트가 추가되었습니다.");
      }
      setEditingEvent(null);
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReport = async (report) => {
    try {
      const { id, submittedAt, submittedBy, ...data } = report;
      const maxRow = events.reduce((max, e) => {
        const match = e.id?.match(/^row(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newKey = `row${maxRow + 1}`;
      await set(ref(database, `data_v2/${newKey}`), {
        ...data,
        confirm: false,
      });
      await remove(ref(database, `reports/${id}`));
      toast.success("제보가 승인되어 이벤트로 등록되었습니다.");
    } catch {
      toast.error("승인 중 오류가 발생했습니다.");
    }
  };

  const handleRejectReport = async (report) => {
    try {
      await remove(ref(database, `reports/${report.id}`));
      toast.success("제보가 거절되었습니다.");
    } catch {
      toast.error("거절 중 오류가 발생했습니다.");
    }
  };

  const handleApproveEditRequest = async (request) => {
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

  const handleRejectEditRequest = async (request) => {
    try {
      await remove(ref(database, `editRequests/${request.id}`));
      toast.success("요청이 거절되었습니다.");
    } catch {
      toast.error("거절 중 오류가 발생했습니다.");
    }
  };

  const tabs = [
    { key: "all", label: "전체", count: stats.total },
    { key: "reports", label: "제보", count: reports.length },
    { key: "editRequests", label: "수정요청", count: editRequests.length },
    { key: "upcoming", label: "예정", count: stats.upcoming },
    { key: "unconfirmed", label: "미표출", count: stats.unconfirmed },
    { key: "past", label: "종료", count: stats.past },
  ];

  // ── 렌더 ──
  return (
    <div className="min-h-screen bg-indigo-50/50 dark:bg-[#242424] transition-colors">
      {/* Sticky Admin Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:opacity-70 transition-opacity shrink-0"
            >
              {/* 모바일: back chevron, sm 이상: 로고 이미지 */}
              <svg
                className="w-5 h-5 sm:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <img
                src="/favicon.svg"
                alt="ANKR"
                className="w-6 h-6 hidden sm:block"
              />
              <span className="hidden sm:block text-base">ANKR.KR</span>
            </Link>
            <svg
              className="w-4 h-4 text-gray-300 dark:text-gray-600 hidden sm:block shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              관리자 페이지
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs sm:text-sm bg-white/70 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page title + Add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              이벤트 관리
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              총 {stats.total}개의 이벤트
            </p>
          </div>
          <button
            onClick={() => setEditingEvent({})}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">이벤트 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-fit flex gap-1 p-1 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 shrink-0 self-start overflow-x-auto sm:overflow-x-visible scrollbar-none [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 text-xs ${
                    tab === t.key
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div
            className={`relative flex-1 ${tab === "reports" || tab === "editRequests" ? "hidden" : ""}`}
          >
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이벤트명, 장소, 장르 검색..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {tab === "reports" ? (
          reportsLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                접수된 제보가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports
                .sort(
                  (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
                )
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
                          ? new Date(report.submittedAt).toLocaleDateString(
                              "ko-KR",
                            )
                          : ""}
                      </span>
                    </div>

                    {toArray(report.genre).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {toArray(report.genre).map((g) => (
                          <span
                            key={g}
                            className={`inline-block px-2 py-0.5 rounded-md text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {(report.time_start ||
                      report.time_entrance ||
                      report.time_end) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {[
                          report.time_start &&
                            `시작 ${isoToTime(report.time_start)}`,
                          report.time_entrance &&
                            `입장 ${isoToTime(report.time_entrance)}`,
                          report.time_end &&
                            `종료 ${isoToTime(report.time_end)}`,
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
                        onClick={() => handleApproveReport(report)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleRejectReport(report)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )
        ) : tab === "editRequests" ? (
          editRequestsLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : editRequests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                접수된 요청이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {editRequests
                .sort(
                  (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
                )
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
                            {request.eventName ||
                              request.event_name ||
                              "(이름 없음)"}
                          </p>
                          <p className="text-xs text-gray-400 text-left dark:text-gray-500 mt-0.5 font-mono">
                            ID: {request.eventId}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {request.submittedAt
                          ? new Date(request.submittedAt).toLocaleDateString(
                              "ko-KR",
                            )
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
                      const original = events.find(
                        (e) => e.id === request.eventId,
                      );
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
                              원본 이벤트를 찾을 수 없습니다. (ID:{" "}
                              {request.eventId})
                            </p>
                          ) : diffs.length === 0 ? (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              원본과 동일한 내용입니다.
                            </p>
                          ) : (
                            diffs.map(({ label, from, to, isGenre, isUrl }) => (
                              <div
                                key={label}
                                className="text-xs text-left space-y-0.5"
                              >
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
                                      <span className="text-gray-400 dark:text-gray-500 self-center">
                                        →
                                      </span>
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
                                      <span className="text-gray-400 dark:text-gray-500">
                                        →
                                      </span>
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
                        onClick={() => handleApproveEditRequest(request)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors ${
                          request.deleteRequest
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                      >
                        {request.deleteRequest
                          ? "승인 (삭제)"
                          : "승인 (덮어쓰기)"}
                      </button>
                      <button
                        onClick={() => handleRejectEditRequest(request)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )
        ) : dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center space-y-2">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {search
                ? `"${search}" 검색 결과가 없습니다.`
                : "이벤트가 없습니다."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                검색 초기화
              </button>
            )}
          </div>
        ) : (
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
                      onClick={() => setEditingEvent(event)}
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
                          {toArray(event.genre)
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
                            onClick={(e) => handleToggleConfirm(event, e)}
                            className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                              event.confirm
                                ? "bg-indigo-600"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            title={
                              event.confirm
                                ? "표출 중 (클릭하여 미표출)"
                                : "미표출 (클릭하여 표출)"
                            }
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                                event.confirm
                                  ? "translate-x-5"
                                  : "translate-x-0"
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
                              setEditingEvent(event);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                            title="수정"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                              setDeleteTarget(event);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="삭제"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                  onClick={() => setEditingEvent(event)}
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
                      onClick={(e) => handleToggleConfirm(event, e)}
                    >
                      <span
                        className={`text-xs font-medium ${event.confirm ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
                      ></span>
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                          event.confirm
                            ? "bg-indigo-600"
                            : "bg-gray-300 dark:bg-gray-600"
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
                      {toArray(event.genre).map((g) => (
                        <span
                          key={g}
                          className={`inline-block px-2 py-0.5 rounded-md text-xs ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 ">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                        setDeleteTarget(event);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
        )}
      </main>

      {/* Edit / Create Modal */}
      {editingEvent !== null && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSave}
          onClose={() => setEditingEvent(null)}
          isSaving={isSaving}
          locationSuggestions={[
            ...new Set(events.map((e) => e.location).filter(Boolean)),
          ].sort()}
          eventNameSuggestions={[
            ...new Set(events.map((e) => e.event_name).filter(Boolean)),
          ].sort()}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  이벤트 삭제
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-medium text-gray-900 dark:text-white">
                    "{deleteTarget.event_name}"
                  </span>
                  을(를) 삭제하시겠습니까?
                  <br />
                  <span className="text-red-500 dark:text-red-400">
                    이 작업은 되돌릴 수 없습니다.
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
