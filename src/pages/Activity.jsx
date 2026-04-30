import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update } from "firebase/database";
import {
  ArrowLeftIcon,
  HeartIcon,
  CheckCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  LinkIcon,
  AtSymbolIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { database } from "../config/firebase";
import { sortByDateTime } from "../utils/dateUtils";
import { RESERVED_SLUGS, RESERVED_NICKNAMES } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useYearEventData } from "../hooks/useYearEventData";
import { EventCard } from "../components/events/EventCard";
import { toast } from "react-toastify";

const isValidSlug = (s) => {
  if (!s || s.length < 3 || s.length > 20) return false;
  if (!/^[a-z0-9]/.test(s) || !/[a-z0-9]$/.test(s)) return false;
  return /^[a-z0-9_-]+$/.test(s);
};

const TABS = [
  { key: "liked", label: "관심 행사", icon: HeartIcon },
  { key: "attended", label: "다녀온 행사", icon: CheckCircleIcon },
];

const SLUG_MSG = {
  checking: { text: "확인 중...", color: "text-gray-400 dark:text-gray-500" },
  available: { text: "사용 가능한 주소입니다.", color: "text-green-500" },
  taken: { text: "이미 사용 중인 주소입니다.", color: "text-red-500" },
  reserved: { text: "사용할 수 없는 주소입니다.", color: "text-red-500" },
  invalid: {
    text: "3~20자, 영문 소문자·숫자·하이픈·언더바 (첫·끝은 영문·숫자).",
    color: "text-red-500",
  },
};

function useSlugCheck(currentOwnerUid, role) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);
  const timer = useRef(null);
  const isPrivileged = role === "owner" || role === "admin";

  const onChange = (raw) => {
    const val = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setInput(val);
    setStatus(null);
    clearTimeout(timer.current);
    if (!val) return;
    if (!isValidSlug(val)) {
      setStatus("invalid");
      return;
    }
    if (!isPrivileged && RESERVED_SLUGS.some((w) => val.includes(w))) {
      setStatus("reserved");
      return;
    }
    setStatus("checking");
    timer.current = setTimeout(async () => {
      const snap = await get(ref(database, `activitySlugs/${val}`));
      const existing = snap.val();
      setStatus(
        !existing || existing === currentOwnerUid ? "available" : "taken",
      );
    }, 400);
  };

  const reset = (initial = "") => {
    clearTimeout(timer.current);
    setInput(initial);
    setStatus(null);
  };

  return { input, status, onChange, reset };
}

export default function Activity() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // ── 슬러그 설정 여부 확인 ────────────────────────────────
  const [hasSlug, setHasSlug] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setHasSlug(false);
      return;
    }
    get(ref(database, `users/${user.uid}/activitySlug`)).then((snap) => {
      setHasSlug(snap.exists());
    });
  }, [user?.uid, authLoading]);

  const pageState = useMemo(() => {
    if (authLoading || (user && hasSlug === null)) return "resolving";
    if (!user) return "auth_required";
    if (!hasSlug) return "setup";
    return "ready";
  }, [authLoading, user, hasSlug]);

  // ── Slug claim ───────────────────────────────────────────
  const claimSlug = useSlugCheck(user?.uid, role);
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (claimSlug.status !== "available" || claiming || !user) return;
    setClaiming(true);
    try {
      const snap = await get(ref(database, `activitySlugs/${claimSlug.input}`));
      if (snap.exists()) {
        claimSlug.onChange(claimSlug.input);
        setClaiming(false);
        return;
      }
      await update(ref(database), {
        [`activitySlugs/${claimSlug.input}`]: user.uid,
        [`users/${user.uid}/activitySlug`]: claimSlug.input,
      });
      setHasSlug(true);
      toast.success("활동 주소가 설정되었습니다!");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setClaiming(false);
    }
  };

  // ── Activity data ────────────────────────────────────────
  const {
    allData: allEvents,
    knownYears,
    loadedYears,
    loadYear,
  } = useYearEventData();

  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [activeTab, setActiveTab] = useState("liked");

  useEffect(() => {
    if (pageState !== "ready" || !user?.uid) return;
    setProfileLoaded(false);
    setActivityData(null);
    const profUnsub = onValue(ref(database, `users/${user.uid}`), (snap) => {
      const val = snap.val() || {};
      setProfile({
        nickname: val.nickname || null,
        activitySlug: val.activitySlug || null,
        historyPublic: val.historyPublic ?? false,
        hiddenEvents: val.hiddenEvents || {},
      });
      setProfileLoaded(true);
    });
    const dataUnsub = onValue(ref(database, `likes/${user.uid}`), (snap) => {
      setActivityData(snap.val() || {});
    });
    return () => {
      profUnsub();
      dataUnsub();
    };
  }, [pageState, user?.uid]);

  useEffect(() => {
    if (!activityData || !knownYears.length) return;
    const allIds = new Set(Object.keys(activityData));
    if (!allIds.size) return;
    const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
    knownYears.forEach(async (year) => {
      if (loadedYears.has(year)) return;
      try {
        const res = await fetch(`${dbUrl}/data_v3/${year}.json?shallow=true`);
        const keys = await res.json();
        if (keys && Object.keys(keys).some((k) => allIds.has(k)))
          loadYear(year);
      } catch {}
    });
  }, [activityData, knownYears, loadedYears]);

  const likedAll = useMemo(() => {
    if (!allEvents || !activityData) return [];
    const ids = Object.entries(activityData)
      .filter(([, v]) => v === "liked" || v === true)
      .map(([k]) => k);
    return allEvents
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => sortByDateTime(a, b, false));
  }, [allEvents, activityData]);

  const attendedAll = useMemo(() => {
    if (!allEvents || !activityData) return [];
    const ids = Object.entries(activityData)
      .filter(([, v]) => v === "attended")
      .map(([k]) => k);
    return allEvents
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => sortByDateTime(a, b, true));
  }, [allEvents, activityData]);

  const currentEvents = activeTab === "liked" ? likedAll : attendedAll;

  // ── 공개 여부 토글 ───────────────────────────────────────
  const toggleHistoryPublic = async () => {
    const next = !profile.historyPublic;
    if (next) {
      const pub = {};
      Object.entries(activityData || {}).forEach(([id, val]) => {
        if (!profile.hiddenEvents[id]) {
          pub[id] = val === "attended" ? "attended" : "liked";
        }
      });
      await update(ref(database), {
        [`users/${user.uid}/historyPublic`]: true,
        [`users/${user.uid}/publicActivity`]: pub,
      });
    } else {
      await set(ref(database, `users/${user.uid}/historyPublic`), false);
    }
    toast.success(
      next ? "내 활동이 공개되었습니다." : "내 활동이 비공개로 설정되었습니다.",
    );
  };

  // ── 이벤트별 공개/비공개 ─────────────────────────────────
  const toggleEventVisibility = async (eventId) => {
    const hidden = !!profile.hiddenEvents[eventId];
    const type = activityData?.[eventId] === "attended" ? "attended" : "liked";
    if (hidden) {
      const updates = { [`users/${user.uid}/hiddenEvents/${eventId}`]: null };
      if (profile.historyPublic)
        updates[`users/${user.uid}/publicActivity/${eventId}`] = type;
      await update(ref(database), updates);
    } else {
      await update(ref(database), {
        [`users/${user.uid}/hiddenEvents/${eventId}`]: true,
        [`users/${user.uid}/publicActivity/${eventId}`]: null,
      });
    }
  };

  // ── 닉네임 편집 ──────────────────────────────────────────
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const saveNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) return;
    const isPrivileged = role === "owner" || role === "admin";
    const lowerNick = trimmed.toLowerCase();
    if (
      !isPrivileged &&
      RESERVED_NICKNAMES.some((w) => lowerNick.includes(w.toLowerCase()))
    ) {
      toast.error("사용할 수 없는 닉네임입니다.");
      return;
    }
    setNicknameSaving(true);
    try {
      await set(ref(database, `users/${user.uid}/nickname`), trimmed);
      setEditingNickname(false);
      toast.success("닉네임이 저장되었습니다.");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setNicknameSaving(false);
    }
  };

  // ── Slug 편집 ────────────────────────────────────────────
  const [editingSlug, setEditingSlug] = useState(false);
  const editSlug = useSlugCheck(user?.uid, role);
  const [slugEditSaving, setSlugEditSaving] = useState(false);

  const saveSlugEdit = async () => {
    const currentSlug = profile?.activitySlug;
    if (
      !isValidSlug(editSlug.input) ||
      editSlug.status !== "available" ||
      slugEditSaving
    )
      return;
    if (editSlug.input === currentSlug) {
      setEditingSlug(false);
      return;
    }
    setSlugEditSaving(true);
    try {
      const snap = await get(ref(database, `activitySlugs/${editSlug.input}`));
      if (snap.exists()) {
        editSlug.onChange(editSlug.input);
        return;
      }
      await update(ref(database), {
        ...(currentSlug ? { [`activitySlugs/${currentSlug}`]: null } : {}),
        [`activitySlugs/${editSlug.input}`]: user.uid,
        [`users/${user.uid}/activitySlug`]: editSlug.input,
      });
      setEditingSlug(false);
      toast.success("활동 주소가 변경되었습니다.");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setSlugEditSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/@${profile?.activitySlug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("링크가 복사되었습니다."));
  };

  // ── Render helpers ───────────────────────────────────────
  const shell = (children) => (
    <div className="min-h-screen bg-indigo-50/50 dark:bg-[#242424] transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
    </div>
  );

  const backBtn = (
    <button
      onClick={() => navigate("/")}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
    >
      <ArrowLeftIcon className="w-5 h-5" />
    </button>
  );

  if (pageState === "resolving") {
    return shell(
      <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
        불러오는 중...
      </div>,
    );
  }

  if (pageState === "auth_required") {
    return shell(
      <>
        <div className="flex items-center gap-3 mb-8">
          {backBtn}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            내 활동
          </h1>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            로그인 후 이용할 수 있습니다.
          </p>
        </div>
      </>,
    );
  }

  if (pageState === "setup") {
    const msg = SLUG_MSG[claimSlug.status];
    return shell(
      <>
        <div className="flex items-center gap-3 mb-8">
          {backBtn}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            내 활동
          </h1>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800/60 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <AtSymbolIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                활동 주소 설정
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                한 번 설정하면 링크로 공유할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
              ankr.kr/@
            </span>
            <input
              autoFocus
              value={claimSlug.input}
              onChange={(e) => claimSlug.onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClaim();
              }}
              maxLength={20}
              placeholder="my-activity"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
            />
          </div>
          {msg && (
            <p className={`text-xs mb-3 px-1 ${msg.color}`}>{msg.text}</p>
          )}
          {!msg && <div className="mb-3" />}
          <button
            onClick={handleClaim}
            disabled={claimSlug.status !== "available" || claiming}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white active:bg-indigo-700 mouse:hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {claiming ? "설정 중..." : "설정하기"}
          </button>
        </div>
      </>,
    );
  }

  // pageState === "ready"
  const displayName = profile?.nickname || "나";
  const activityLoading = !profileLoaded || activityData === null || !allEvents;
  const slugEditMsg = SLUG_MSG[editSlug.status];

  return shell(
    <>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        {backBtn}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          내 활동
        </h1>
        {profile?.historyPublic && profile?.activitySlug && (
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
            aria-label="링크 복사"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 프로필 카드 */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-gray-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNickname();
                    if (e.key === "Escape") setEditingNickname(false);
                  }}
                  maxLength={20}
                  className="flex-1 min-w-0 text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-400 focus:outline-none"
                  placeholder="닉네임 입력 (최대 20자)"
                />
                <button
                  onClick={saveNickname}
                  disabled={nicknameSaving}
                  className="p-1 text-indigo-600 dark:text-indigo-400 disabled:opacity-40"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingNickname(false)}
                  className="p-1 text-gray-400"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 text-left">
                <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {displayName}
                </span>
                <button
                  onClick={() => {
                    setNicknameInput(profile?.nickname || "");
                    setEditingNickname(true);
                  }}
                  className="p-1 rounded flex-shrink-0 text-gray-400 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-200 dark:mouse:hover:text-gray-200 transition-colors"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!editingNickname && (
              <div className="mt-0.5">
                {editingSlug ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
                        ankr.kr/@
                      </span>
                      <input
                        autoFocus
                        value={editSlug.input}
                        onChange={(e) => editSlug.onChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveSlugEdit();
                          if (e.key === "Escape") {
                            setEditingSlug(false);
                            editSlug.reset();
                          }
                        }}
                        maxLength={20}
                        className="w-28 text-xs text-gray-700 dark:text-gray-300 bg-transparent border-b border-indigo-400 focus:outline-none"
                      />
                      <button
                        onClick={saveSlugEdit}
                        disabled={
                          editSlug.status !== "available" || slugEditSaving
                        }
                        className="p-0.5 text-indigo-600 dark:text-indigo-400 disabled:opacity-40"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlug(false);
                          editSlug.reset();
                        }}
                        className="p-0.5 text-gray-400"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {slugEditMsg && (
                      <p className={`text-xs mt-0.5 ${slugEditMsg.color}`}>
                        {slugEditMsg.text}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      ankr.kr/@{profile?.activitySlug}
                    </span>
                    <button
                      onClick={() => {
                        editSlug.reset(profile?.activitySlug || "");
                        setEditingSlug(true);
                      }}
                      className="p-0.5 rounded flex-shrink-0 text-gray-300 dark:text-gray-600 active:text-gray-500 mouse:hover:text-gray-500 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 공개/비공개 토글 */}
          {profile && !editingNickname && !editingSlug && (
            <button
              onClick={toggleHistoryPublic}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 flex-shrink-0 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {profile.historyPublic ? (
                <GlobeAltIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              )}
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  profile.historyPublic
                    ? "bg-indigo-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-flex h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-out ${
                    profile.historyPublic ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {profile.historyPublic ? "공개" : "비공개"}
              </span>
            </button>
          )}
        </div>

        {profile && !editingNickname && !editingSlug && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {profile.historyPublic
              ? "활동 페이지가 공개 중입니다. 링크 버튼으로 공유할 수 있습니다."
              : "활동 페이지가 비공개 상태입니다. 나만 볼 수 있습니다."}
          </p>
        )}
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === "liked" ? likedAll.length : attendedAll.length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-none font-medium border-b-2 -mb-px transition-colors duration-200 ${
                activeTab === key
                  ? "text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400 focus:outline-none"
                  : "text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {!activityLoading && (
                <span className="text-xs opacity-60">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {!activityLoading && currentEvents.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 px-1">
          카드를 눌러 이벤트별 공개 여부를 전환할 수 있습니다.
        </p>
      )}

      {/* 이벤트 목록 */}
      {activityLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          불러오는 중...
        </div>
      ) : currentEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          {activeTab === "liked"
            ? "관심 행사가 없습니다."
            : "다녀온 행사가 없습니다."}
        </div>
      ) : (
        <div className="space-y-3">
          {currentEvents.map((event) => {
            const isHidden = !!profile?.hiddenEvents[event.id];
            return (
              <div key={event.id} className={`transition-opacity ${isHidden ? "opacity-40" : ""}`}>
                <div className="relative">
                  <EventCard
                    event={event}
                    onEventSelect={() => toggleEventVisibility(event.id)}
                    showHeart={false}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow transition-colors cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/40"
                  />
                  {/* 자세히 보기 - 데스크탑 absolute */}
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="hidden sm:flex absolute bottom-2 right-2 z-10 items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                  >
                    자세히 보기
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                  {/* 공개/비공개 상태 표시 - 우상단 */}
                  <div className="absolute top-2 right-2 z-20 p-1 text-gray-400 dark:text-gray-500 pointer-events-none">
                    {isHidden ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </div>
                </div>
                {/* 자세히 보기 - 모바일 행 */}
                <div className="flex sm:hidden justify-end items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
                  >
                    자세히 보기
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>,
  );
}
