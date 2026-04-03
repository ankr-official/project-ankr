import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as adminApi from "../../utils/adminApi";
import { useScrollLock } from "../../hooks/useScrollLock";
import TabBar from "./TabBar";

function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex w-full justify-center items-center gap-1 font-semibold text-gray-600 dark:text-gray-400 active:text-gray-900 mouse:hover:text-gray-900 dark:active:text-white dark:mouse:hover:text-white transition-colors"
    >
      {label}
      {active ? (
        <svg
          className="w-3.5 h-3.5 text-indigo-500 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sort.dir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4M8 15l4 4 4-4"
          />
        </svg>
      )}
    </button>
  );
}

const formatCreatedAt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const date = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}.`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
};

export default function AdminUsersTab({ currentUid, currentRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [reasonModal, setReasonModal] = useState(null); // { email, reason }
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [tab, setTab] = useState("all");
  useScrollLock(!!(reasonModal || suspendTarget || deleteTarget));

  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const counts = {
    all: users.length,
    owner: users.filter((u) => u.role === "owner").length,
    admin: users.filter((u) => u.role === "admin").length,
    member: users.filter(
      (u) => u.role !== "admin" && u.role !== "owner" && !u.disabled,
    ).length,
    disabled: users.filter((u) => u.disabled).length,
  };

  useEffect(() => {
    if (tab !== "all" && counts[tab] === 0) setTab("all");
  }, [tab, counts.owner, counts.admin, counts.member, counts.disabled]);

  const sortedUsers = [...users]
    .filter((u) => {
      if (tab === "owner") return u.role === "owner";
      if (tab === "admin") return u.role === "admin";
      if (tab === "member")
        return u.role !== "admin" && u.role !== "owner" && !u.disabled;
      if (tab === "disabled") return u.disabled;
      return true;
    })
    .sort((a, b) => {
      if (a.uid === currentUid) return -1;
      if (b.uid === currentUid) return 1;
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (b.role === "owner" && a.role !== "owner") return 1;
      const aVal =
        sort.key === "createdAt"
          ? a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0
          : (a.email || "").toLowerCase();
      const bVal =
        sort.key === "createdAt"
          ? b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0
          : (b.email || "").toLowerCase();
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { users: list } = await adminApi.listUsers();
        if (active)
          setUsers(
            list.sort((a, b) =>
              a.uid === currentUid ? -1 : b.uid === currentUid ? 1 : 0,
            ),
          );
      } catch {
        toast.error("회원 목록을 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    setActionLoading(user.uid);
    try {
      await adminApi.setUserRole(user.uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u)),
      );
      toast.success(
        `권한이 ${newRole === "admin" ? "관리자" : "일반 회원"}으로 변경되었습니다.`,
      );
    } catch {
      toast.error("권한 변경 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowReason = async (user) => {
    setReasonModal({ email: user.email, reason: null }); // null = 로딩 중
    try {
      const data = await adminApi.getSuspensionReason(user.email);
      setReasonModal({ email: user.email, reason: data.reason || "" });
    } catch {
      setReasonModal({ email: user.email, reason: "" });
    }
  };

  const handleSuspendConfirm = async () => {
    if (!suspendTarget) return;
    setActionLoading(suspendTarget.uid);
    try {
      await adminApi.setUserDisabled(
        suspendTarget.uid,
        true,
        suspendReason.trim(),
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === suspendTarget.uid ? { ...u, disabled: true } : u,
        ),
      );
      toast.success("계정이 차단되었습니다.");
      setSuspendTarget(null);
      setSuspendReason("");
    } catch {
      toast.error("계정 차단 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (user) => {
    setActionLoading(user.uid);
    try {
      await adminApi.setUserDisabled(user.uid, false);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, disabled: false } : u)),
      );
      toast.success("계정 차단가 해제되었습니다.");
    } catch {
      toast.error("계정 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== deleteTarget.uid));
      toast.success("계정이 삭제되었습니다.");
      setDeleteTarget(null);
    } catch {
      toast.error("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center space-y-2">
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          등록된 회원이 없습니다.
        </p>
      </div>
    );
  }

  const userTabs = [
    { key: "all", label: "전체", count: counts.all },
    counts.admin > 0 && { key: "admin", label: "관리자", count: counts.admin },
    counts.member > 0 && { key: "member", label: "일반", count: counts.member },
    counts.disabled > 0 && {
      key: "disabled",
      label: "차단",
      count: counts.disabled,
    },
  ].filter(Boolean);

  return (
    <>
      {/* ── Tabs ── */}
      <TabBar tabs={userTabs} active={tab} onChange={setTab} />

      {/* ── Desktop Table (lg+) ── */}
      <div className="hidden lg:block rounded-2xl border border-gray-200/70 dark:border-gray-900/50 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200/70 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900">
              <th className="text-center px-4 py-3 w-44">
                <SortHeader
                  label="등록일"
                  sortKey="createdAt"
                  sort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="text-center px-4 py-3">
                <SortHeader
                  label="이메일"
                  sortKey="email"
                  sort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-28">
                권한
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-72">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
            {sortedUsers.map((user) => {
              const isActing = actionLoading === user.uid;
              const isSelf = user.uid === currentUid;
              return (
                <tr
                  key={user.uid}
                  className="group active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-700/40 dark:mouse:hover:bg-gray-700/40 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatCreatedAt(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="block truncate">{user.email}</span>
                      {isSelf && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          나
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.disabled ? (
                      <button
                        onClick={() => handleShowReason(user)}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 active:bg-amber-200 mouse:hover:bg-amber-200 dark:active:bg-amber-900/50 dark:mouse:hover:bg-amber-900/50 transition-colors"
                      >
                        차단
                      </button>
                    ) : user.role === "owner" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        운영자
                      </span>
                    ) : user.role === "admin" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        관리자
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        일반
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf || user.role === "owner" || (currentRole !== "owner" && user.role === "admin") ? (
                      <span className="block text-center text-xs text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {isActing ? (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          <>
                            {/* 권한 변경 — 운영자만 */}
                            {currentRole === "owner" && (
                              <button
                                onClick={() => handleRoleChange(user)}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                  user.role === "admin"
                                    ? "text-gray-500 active:text-amber-600 mouse:hover:text-amber-600 dark:active:text-amber-400 dark:mouse:hover:text-amber-400 active:bg-amber-50 mouse:hover:bg-amber-50 dark:active:bg-amber-950/30 dark:mouse:hover:bg-amber-950/30"
                                    : "text-gray-500 active:text-indigo-600 mouse:hover:text-indigo-600 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 active:bg-indigo-50 mouse:hover:bg-indigo-50 dark:active:bg-indigo-950/30 dark:mouse:hover:bg-indigo-950/30"
                                }`}
                                title={
                                  user.role === "admin"
                                    ? "관리자 권한 해제"
                                    : "관리자로 지정"
                                }
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
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                                {user.role === "admin"
                                  ? "권한 해제"
                                  : "관리자 지정"}
                              </button>
                            )}
                            {/* 차단 / 해제 */}
                            <button
                              onClick={() =>
                                user.disabled
                                  ? handleUnsuspend(user)
                                  : setSuspendTarget(user)
                              }
                              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                user.disabled
                                  ? "text-gray-500 active:text-green-600 mouse:hover:text-green-600 dark:active:text-green-400 dark:mouse:hover:text-green-400 active:bg-green-50 mouse:hover:bg-green-50 dark:active:bg-green-950/30 dark:mouse:hover:bg-green-950/30"
                                  : "text-gray-500 active:text-amber-600 mouse:hover:text-amber-600 dark:active:text-amber-400 dark:mouse:hover:text-amber-400 active:bg-amber-50 mouse:hover:bg-amber-50 dark:active:bg-amber-950/30 dark:mouse:hover:bg-amber-950/30"
                              }`}
                              title={user.disabled ? "차단 해제" : "계정 차단"}
                            >
                              {user.disabled ? (
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
                                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                  />
                                </svg>
                              ) : (
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
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              )}
                              {user.disabled ? "차단 해제" : "차단"}
                            </button>
                            {/* 삭제 */}
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap text-gray-500 active:text-red-600 mouse:hover:text-red-600 dark:active:text-red-400 dark:mouse:hover:text-red-400 active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-950/30 dark:mouse:hover:bg-red-950/30 transition-colors"
                              title="계정 삭제"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List (< lg) ── */}
      <div className="lg:hidden space-y-3">
        {sortedUsers.map((user) => {
          const isActing = actionLoading === user.uid;
          const isSelf = user.uid === currentUid;
          return (
            <div
              key={user.uid}
              className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-left text-gray-400 dark:text-gray-500 mb-1">
                    등록일: {formatCreatedAt(user.createdAt)}
                  </p>
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {user.email}
                    </p>
                    {isSelf && (
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        나
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {user.disabled ? (
                      <button
                        onClick={() => handleShowReason(user)}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 active:bg-amber-200 mouse:hover:bg-amber-200 dark:active:bg-amber-900/50 dark:mouse:hover:bg-amber-900/50 transition-colors"
                      >
                        차단
                      </button>
                    ) : user.role === "owner" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        운영자
                      </span>
                    ) : user.role === "admin" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        관리자
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        일반
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isSelf && user.role !== "owner" && !(currentRole !== "owner" && user.role === "admin") && (
                <div className="flex gap-2 pt-1">
                  {currentRole === "owner" && (
                    <button
                      onClick={() => handleRoleChange(user)}
                      disabled={isActing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:bg-indigo-50 mouse:hover:bg-indigo-50 dark:active:bg-indigo-950/30 dark:mouse:hover:bg-indigo-950/30 active:text-indigo-600 mouse:hover:text-indigo-600 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors disabled:opacity-40"
                    >
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      {user.role === "admin" ? "권한 해제" : "관리자 지정"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      user.disabled
                        ? handleUnsuspend(user)
                        : setSuspendTarget(user)
                    }
                    disabled={isActing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:bg-amber-50 mouse:hover:bg-amber-50 dark:active:bg-amber-950/30 dark:mouse:hover:bg-amber-950/30 active:text-amber-600 mouse:hover:text-amber-600 dark:active:text-amber-400 dark:mouse:hover:text-amber-400 transition-colors disabled:opacity-40"
                  >
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {user.disabled ? "차단 해제" : "계정 차단"}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    disabled={isActing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-950/30 dark:mouse:hover:bg-red-950/30 active:text-red-600 mouse:hover:text-red-600 dark:active:text-red-400 dark:mouse:hover:text-red-400 transition-colors disabled:opacity-40"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    삭제
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 차단 사유 확인 모달 ── */}
      {reasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  차단 사유
                </h3>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 break-all">
                  {reasonModal.email}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-4 py-3">
              {reasonModal.reason === null ? (
                <div className="flex justify-center py-1">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reasonModal.reason ? (
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {reasonModal.reason}
                </p>
              ) : (
                <p className="text-sm text-amber-600/60 dark:text-amber-400/50 italic">
                  사유 없음
                </p>
              )}
            </div>
            <button
              onClick={() => setReasonModal(null)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ── 차단 사유 입력 모달 ── */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  계정 차단
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-all">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {suspendTarget.email}
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                차단 사유
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="차단 사유를 입력하세요 (선택)"
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSuspendTarget(null);
                  setSuspendReason("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSuspendConfirm}
                disabled={actionLoading === suspendTarget?.uid}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-amber-500 active:bg-amber-600 mouse:hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === suspendTarget?.uid && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                차단
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
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
                  계정 삭제
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-medium text-gray-900 dark:text-white break-all">
                    {deleteTarget.email}
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
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-red-600 active:bg-red-700 mouse:hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    </>
  );
}
