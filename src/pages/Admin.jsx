import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, remove, update, set, get } from "firebase/database";
import { toast } from "react-toastify";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { toArray, GENRES } from "../utils/eventFormUtils";
import EventEditModal from "../components/admin/EventEditModal";
import AdminHeader from "../components/admin/AdminHeader";
import AdminReportsTab from "../components/admin/AdminReportsTab";
import AdminEditRequestsTab from "../components/admin/AdminEditRequestsTab";
import AdminEventsTab from "../components/admin/AdminEventsTab";
import DeleteConfirmDialog from "../components/admin/DeleteConfirmDialog";
import AdminUsersTab from "../components/admin/AdminUsersTab";
import TabBar from "../components/admin/TabBar";

export default function Admin() {
  const navigate = useNavigate();
  const { role, user, signOut, loading: authLoading } = useAuth();
  const { data: events, loading: dataLoading } = useRealtimeData("data_v2");

  // ── 모든 훅은 조건부 return 전에 선언 ──
  const [section, setSection] = useState("events");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingReportId, setApprovingReportId] = useState(null);
  const [reportsCount, setReportsCount] = useState(0);
  const [editRequestsCount, setEditRequestsCount] = useState(0);

  // 초기 카운트를 get()으로 한 번만 조회 (탭 뱃지 표시용)
  useEffect(() => {
    get(ref(database, "reports")).then((snap) => {
      setReportsCount(snap.exists() ? Object.keys(snap.val()).length : 0);
    }).catch(() => {});
    get(ref(database, "editRequests")).then((snap) => {
      setEditRequestsCount(snap.exists() ? Object.keys(snap.val()).length : 0);
    }).catch(() => {});
  }, []);

  const now = new Date();

  const getEventTime = (e) =>
    e.time_start ? new Date(e.time_start) : new Date(e.schedule);

  const stats = useMemo(() => {
    const upcoming = events.filter(
      (e) => getEventTime(e) >= now && e.confirm,
    ).length;
    const past = events.filter((e) => getEventTime(e) < now).length;
    const unconfirmed = events.filter((e) => !e.confirm).length;
    return { total: events.length, upcoming, past, unconfirmed };
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (tab === "upcoming")
      filtered = filtered.filter((e) => getEventTime(e) >= now);
    else if (tab === "past")
      filtered = filtered.filter((e) => getEventTime(e) < now);
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
        ? getEventTime(a) - getEventTime(b)
        : getEventTime(b) - getEventTime(a),
    );
  }, [events, tab, search]);

  useEffect(() => {
    if (tab === "reports" && reportsCount === 0) setTab("upcoming");
    if (tab === "editRequests" && editRequestsCount === 0) setTab("upcoming");
    if (tab === "unconfirmed" && stats.unconfirmed === 0) setTab("upcoming");
  }, [tab, reportsCount, editRequestsCount, stats.unconfirmed]);

  // ── 훅 선언 완료 후 조건부 early return ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50/50 dark:bg-[#242424]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (role !== "admin" && role !== "owner") {
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
            className="inline-block px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium active:bg-indigo-700 mouse:hover:bg-indigo-700 transition-colors"
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
        await set(ref(database, `data_v2/row${maxRow + 1}`), data);
        if (approvingReportId) {
          await remove(ref(database, `reports/${approvingReportId}`));
          toast.success("제보가 승인되어 이벤트로 등록되었습니다.");
        } else {
          toast.success("이벤트가 추가되었습니다.");
        }
      }
      setEditingEvent(null);
      setApprovingReportId(null);
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReport = (report) => {
    const { id, submittedAt, submittedBy, ...data } = report;
    setApprovingReportId(id);
    setEditingEvent({ ...data, confirm: false });
  };

  const tabs = [
    { key: "all", label: "전체", count: stats.total },
    reportsCount > 0 && {
      key: "reports",
      label: "제보",
      count: reportsCount,
    },
    editRequestsCount > 0 && {
      key: "editRequests",
      label: "수정요청",
      count: editRequestsCount,
    },
    stats.unconfirmed > 0 && {
      key: "unconfirmed",
      label: "미표출",
      count: stats.unconfirmed,
    },
    { key: "upcoming", label: "예정", count: stats.upcoming },
    { key: "past", label: "종료", count: stats.past },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-indigo-50/50 dark:bg-[#242424] transition-colors">
      <AdminHeader user={user} signOut={signOut} navigate={navigate} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Section selector */}
        <div className="flex gap-1 p-1 rounded-xl w-full sm:w-fit bg-gray-200/60 dark:bg-gray-800/60">
          <button
            onClick={() => setSection("events")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              section === "events"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 active:text-gray-800 mouse:hover:text-gray-800 dark:active:text-gray-200 dark:mouse:hover:text-gray-200"
            }`}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            이벤트
          </button>
          <button
            onClick={() => setSection("users")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              section === "users"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 active:text-gray-800 mouse:hover:text-gray-800 dark:active:text-gray-200 dark:mouse:hover:text-gray-200"
            }`}
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            회원
          </button>
        </div>

        {section === "users" ? (
          <AdminUsersTab currentUid={user?.uid} currentRole={role} />
        ) : (
          <>
            {/* Tabs */}
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {/* Search + Add button */}
            <div className="flex items-center gap-2">
              <div
                className={`relative flex-1 h-10 ${tab === "reports" || tab === "editRequests" ? "hidden" : ""}`}
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
                  className="w-full h-full pl-9 pr-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-200 dark:mouse:hover:text-gray-200"
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

              <button
                onClick={() => setEditingEvent({})}
                className="shrink-0 h-10 inline-flex items-center gap-1.5 px-3 sm:px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors shadow-sm"
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

            {/* Content */}
            {tab === "reports" ? (
              <AdminReportsTab
                onApprove={handleApproveReport}
                onCountChange={setReportsCount}
              />
            ) : tab === "editRequests" ? (
              <AdminEditRequestsTab
                events={events}
                onCountChange={setEditRequestsCount}
              />
            ) : (
              <AdminEventsTab
                filteredEvents={filteredEvents}
                dataLoading={dataLoading}
                search={search}
                onClearSearch={() => setSearch("")}
                onEdit={setEditingEvent}
                onDelete={setDeleteTarget}
                onToggleConfirm={handleToggleConfirm}
              />
            )}
          </>
        )}
      </main>

      {editingEvent !== null && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSave}
          onClose={() => {
            setEditingEvent(null);
            setApprovingReportId(null);
          }}
          isSaving={isSaving}
          locationSuggestions={[
            ...new Set(events.map((e) => e.location).filter(Boolean)),
          ].sort()}
          eventNameSuggestions={[
            ...new Set(events.map((e) => e.event_name).filter(Boolean)),
          ].sort()}
          genreSuggestions={[
            ...new Set(
              events
                .flatMap((e) => toArray(e.genre))
                .filter((g) => g && !GENRES.includes(g)),
            ),
          ]}
        />
      )}

      <DeleteConfirmDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
