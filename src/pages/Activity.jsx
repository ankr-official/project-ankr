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
  ChevronDownIcon,
  PlusIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { database } from "../config/firebase";
import { sortByDateTime, toKSTDate } from "../utils/dateUtils";
import { RESERVED_SLUGS, RESERVED_NICKNAMES } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useYearEventData } from "../hooks/useYearEventData";
import { EventCard } from "../components/events/EventCard";
import { AttendedPicker } from "../components/AttendedPicker";
import { AttendedReceiptModal } from "../components/AttendedReceiptModal";
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

const QUARTERS = [
  { key: "all", label: "전체" },
  { key: "Q1", label: "1분기" },
  { key: "Q2", label: "2분기" },
  { key: "Q3", label: "3분기" },
  { key: "Q4", label: "4분기" },
];

const getQuarter = (dateStr) => {
  const month = toKSTDate(dateStr).getUTCMonth();
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

const isPast = (event) => {
  if (event.time_start) return new Date(event.time_start) < new Date();
  const todayKST = toKSTDate(new Date()).toISOString().slice(0, 10);
  return event.schedule.slice(0, 10) < todayKST;
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
    loadingYears,
    loadYear,
    loading: eventsLoading,
  } = useYearEventData();

  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [activeTab, setActiveTab] = useState("liked");

  // ── 모달 / 필터 state ────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem("dismissedBanners");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // ── 닉네임 / slug 편집 state (훅 규칙: early return 앞에) ─
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const editSlug = useSlugCheck(user?.uid, role);
  const [slugEditSaving, setSlugEditSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
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
  }, [user?.uid]);

  // shallow fetch를 시도한 연도를 추적 — loadedYears를 deps에 넣으면
  // 연도 로드 완료마다 effect가 재실행되어 중복 fetch가 발생하므로 ref로 관리
  const shallowCheckedRef = useRef(new Set());

  useEffect(() => {
    if (!activityData || !knownYears.length) return;
    const allIds = new Set(Object.keys(activityData));
    if (!allIds.size) return;
    const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
    Promise.all(
      knownYears.map(async (year) => {
        if (shallowCheckedRef.current.has(year)) return;
        shallowCheckedRef.current.add(year);
        try {
          const res = await fetch(`${dbUrl}/data_v3/${year}.json?shallow=true`);
          const keys = await res.json();
          if (keys && Object.keys(keys).some((k) => allIds.has(k)))
            loadYear(year);
        } catch {
          shallowCheckedRef.current.delete(year);
        }
      })
    );
  }, [activityData, knownYears]);

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

  // ── 다녀온 탭 연도/분기 필터 ─────────────────────────────
  const availableYears = useMemo(() => {
    const years = new Set(
      attendedAll.map((e) => toKSTDate(e.schedule).getUTCFullYear()),
    );
    return knownYears.filter((y) => years.has(y));
  }, [attendedAll, knownYears]);

  const effectiveYear = selectedYear ?? availableYears[0] ?? null;

  const activeQuarters = useMemo(() => {
    if (!effectiveYear) return new Set();
    return new Set(
      attendedAll
        .filter((e) => toKSTDate(e.schedule).getUTCFullYear() === effectiveYear)
        .map((e) => getQuarter(e.schedule)),
    );
  }, [attendedAll, effectiveYear]);

  const filteredAttendedEvents = useMemo(() => {
    return attendedAll.filter((e) => {
      if (effectiveYear && toKSTDate(e.schedule).getUTCFullYear() !== effectiveYear)
        return false;
      if (
        selectedQuarter !== "all" &&
        getQuarter(e.schedule) !== selectedQuarter
      )
        return false;
      return true;
    });
  }, [attendedAll, effectiveYear, selectedQuarter]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedQuarter("all");
  };

  // ── 배너 숨김 ────────────────────────────────────────────
  const dismiss = (eventId) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(eventId);
      localStorage.setItem("dismissedBanners", JSON.stringify([...next]));
      return next;
    });
  };

  const restoreDismiss = (eventId) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      localStorage.setItem("dismissedBanners", JSON.stringify([...next]));
      return next;
    });
  };

  // ── 탭 간 이동 ───────────────────────────────────────────
  const reclassify = async (eventId) => {
    const updates = { [`likes/${user.uid}/${eventId}`]: "attended" };
    if (profile?.historyPublic && !profile?.hiddenEvents?.[eventId]) {
      updates[`users/${user.uid}/publicActivity/${eventId}`] = "attended";
    }
    await update(ref(database), updates);
  };

  const reclassifyToLiked = async (eventId) => {
    const updates = { [`likes/${user.uid}/${eventId}`]: "liked" };
    if (profile?.historyPublic && !profile?.hiddenEvents?.[eventId]) {
      updates[`users/${user.uid}/publicActivity/${eventId}`] = "liked";
    }
    await update(ref(database), updates);
  };

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

  const uidSuffix = user?.uid
    ? String(
        user.uid
          .split("")
          .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 1000000,
      ).padStart(6, "0")
    : "000000";
  const displayName = profile?.nickname || `익명${uidSuffix}`;
  const activityLoading = !profileLoaded || activityData === null || eventsLoading;
  const slugEditMsg = SLUG_MSG[editSlug.status];

  const renderEventCard = (event, tab) => {
    const isHidden = !!profile?.hiddenEvents[event.id];
    const hasBanner =
      tab === "liked" && isPast(event) && !dismissed.has(event.id);
    const hasDismissed =
      tab === "liked" && isPast(event) && dismissed.has(event.id);

    return (
      <div key={event.id}>
        <div
          className={`relative transition-opacity ${isHidden ? "opacity-40" : ""}`}
        >
          <EventCard
            event={event}
            onEventSelect={() => toggleEventVisibility(event.id)}
            showHeart={tab === "liked"}
            className={`p-4 bg-gray-100 dark:bg-gray-800 shadow transition-colors cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/40 ${
              hasBanner ? "rounded-t-lg" : "rounded-t-lg sm:rounded-lg"
            }`}
          />
          {/* Check badge - 다녀온 행사 */}
          {tab === "attended" && (
            <div
              className="absolute top-2 right-2 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => reclassifyToLiked(event.id)}
                className="w-6 h-6 p-0 rounded-full bg-indigo-600 flex items-center justify-center active:opacity-70 mouse:hover:opacity-70 transition-opacity"
              >
                <CheckIcon className="w-3.5 h-3.5 text-white shrink-0" />
              </button>
            </div>
          )}
          {/* Eye 아이콘 - 카드 중앙 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {isHidden ? (
              <EyeSlashIcon className="w-8 h-8 text-gray-500/60 dark:text-gray-400/60" />
            ) : (
              <EyeIcon className="w-8 h-8 text-gray-400/25 dark:text-gray-500/25" />
            )}
          </div>
          {/* 자세히 보기 - 데스크탑 absolute right */}
          <button
            onClick={() => navigate(`/event/${event.id}`)}
            className="hidden sm:flex absolute bottom-2 right-2 z-10 items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
          >
            자세히 보기
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
          {/* 배너 숨긴 경우 복구 버튼 - 데스크탑 */}
          {hasDismissed && (
            <button
              onClick={() => restoreDismiss(event.id)}
              className="hidden sm:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-gray-400 dark:text-gray-600 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
              aria-label="알림 다시 보기"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 모바일 하단 행 (배너 없을 때) */}
        {!hasBanner && (
          <div className="flex sm:hidden justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
            {hasDismissed && tab !== "attended" ? (
              <button
                onClick={() => restoreDismiss(event.id)}
                className="text-gray-400 dark:text-gray-600 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
                aria-label="알림 다시 보기"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={() => navigate(`/event/${event.id}`)}
              className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
            >
              자세히 보기
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 지난 관심 행사 배너 */}
        {hasBanner && (
          <div className="rounded-b-lg bg-gray-50 dark:bg-gray-800/60">
            <div className="flex sm:hidden justify-end items-center px-4 pt-2">
              <button
                onClick={() => navigate(`/event/${event.id}`)}
                className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 active:text-indigo-700 mouse:hover:text-indigo-700 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 transition-colors"
              >
                자세히 보기
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                이미 지난 행사예요. 다녀오셨나요?
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => dismiss(event.id)}
                  className="text-xs text-gray-400 dark:text-indigo-500 active:text-indigo-800 mouse:hover:text-indigo-800 dark:active:text-gray-400 dark:mouse:hover:text-gray-400 transition-colors"
                >
                  알림 숨기기
                </button>
                <button
                  onClick={() => reclassify(event.id)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 active:text-indigo-800 mouse:hover:text-indigo-800 dark:active:text-indigo-200 dark:mouse:hover:text-indigo-200 underline underline-offset-2 transition-colors"
                >
                  다녀온 행사로 이동
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return shell(
    <>
      {showPicker && (
        <AttendedPicker
          user={user}
          allEvents={allEvents}
          likes={activityData}
          onClose={() => setShowPicker(false)}
          knownYears={knownYears}
          loadedYears={loadedYears}
          loadingYears={loadingYears}
          onYearLoad={loadYear}
        />
      )}
      {showReceipt && (
        <AttendedReceiptModal
          events={filteredAttendedEvents}
          year={effectiveYear}
          quarter={selectedQuarter}
          onClose={() => setShowReceipt(false)}
        />
      )}

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

      {/* 프로필 카드 / 활동 주소 설정 */}
      {!hasSlug ? (
        <div className="mb-6 p-4 rounded-xl bg-white dark:bg-gray-800/60 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <AtSymbolIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold pb-1 text-gray-900 dark:text-white">
                활동 주소 설정
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                설정하면 활동 페이지를 링크로 공유할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
              ankr.kr/@
            </span>
            <input
              value={claimSlug.input}
              onChange={(e) => claimSlug.onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClaim();
              }}
              maxLength={20}
              placeholder="my-activity"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleClaim}
              disabled={claimSlug.status !== "available" || claiming}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white active:bg-indigo-700 mouse:hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {claiming ? "…" : "설정"}
            </button>
          </div>
          {(() => {
            const msg = SLUG_MSG[claimSlug.status];
            return msg ? (
              <p className={`text-xs px-1 ${msg.color}`}>{msg.text}</p>
            ) : null;
          })()}
        </div>
      ) : (
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
                      <button
                        onClick={() =>
                          navigator.clipboard
                            .writeText(
                              `${window.location.origin}/@${profile?.activitySlug}`,
                            )
                            .then(() => toast.success("링크가 복사되었습니다."))
                        }
                        className="text-xs text-gray-400 dark:text-gray-500 truncate active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors p-0"
                      >
                        ankr.kr/@{profile?.activitySlug}
                      </button>
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
                      profile.historyPublic
                        ? "translate-x-4"
                        : "translate-x-0.5"
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
      )}

      {/* 탭 + 액션 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count =
              key === "liked" ? likedAll.length : attendedAll.length;
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
        {activeTab === "attended" && (
          <div className="flex items-center justify-end gap-2 sm:ml-auto">
            {attendedAll.length > 0 && (
              <button
                onClick={() => setShowReceipt(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 active:bg-indigo-100 mouse:hover:bg-indigo-100 dark:active:bg-indigo-900/40 dark:mouse:hover:bg-indigo-900/40 transition-colors w-full sm:w-fit justify-center"
              >
                <TicketIcon className="w-4 h-4" />
                영수증 발급
              </button>
            )}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 active:bg-indigo-100 mouse:hover:bg-indigo-100 dark:active:bg-indigo-900/40 dark:mouse:hover:bg-indigo-900/40 transition-colors w-full sm:w-fit justify-center"
            >
              <PlusIcon className="w-4 h-4" />
              행사 추가
            </button>
          </div>
        )}
      </div>

      {/* 다녀온 탭: 연도/분기 필터 */}
      {activeTab === "attended" && availableYears.length > 0 && (
        <div className="flex flex-col gap-2 mb-2 p-3 rounded-lg bg-gray-300/50 dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  effectiveYear === year
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700"
                }`}
              >
                {year}년
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {QUARTERS.map(({ key, label }) => {
              const disabled = key !== "all" && !activeQuarters.has(key);
              return (
                <button
                  key={key}
                  onClick={() => !disabled && setSelectedQuarter(key)}
                  disabled={disabled}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    disabled
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : selectedQuarter === key
                        ? "bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 공개/비공개 전환 안내 */}
      {!activityLoading &&
        (activeTab === "liked"
          ? likedAll.length
          : filteredAttendedEvents.length) > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 px-1">
            카드를 눌러 이벤트별 공개 여부를 전환할 수 있습니다.
          </p>
        )}

      {/* 이벤트 목록 */}
      {activityLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          불러오는 중...
        </div>
      ) : activeTab === "liked" ? (
        likedAll.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
            관심 행사가 없습니다.
          </div>
        ) : (
          (() => {
            const upcomingLiked = likedAll.filter((e) => !isPast(e));
            const pastLiked = likedAll.filter((e) => isPast(e));
            return (
              <div className="space-y-6">
                {upcomingLiked.length > 0 && (
                  <div>
                    <p className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 my-4 mb-2 px-2">
                      다가오는 행사
                    </p>
                    <div className="space-y-3">
                      {upcomingLiked.map((e) => renderEventCard(e, "liked"))}
                    </div>
                  </div>
                )}
                {pastLiked.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between my-4 mb-2 px-2">
                      <p className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        지난 행사
                      </p>
                      <button
                        onClick={() => pastLiked.forEach((e) => dismiss(e.id))}
                        className="text-xs text-gray-400 dark:text-gray-500 active:text-gray-600 mouse:hover:text-gray-600 dark:active:text-gray-300 dark:mouse:hover:text-gray-300 transition-colors"
                      >
                        모든 알림 숨기기
                      </button>
                    </div>
                    <div className="space-y-3">
                      {pastLiked.map((e) => renderEventCard(e, "liked"))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )
      ) : filteredAttendedEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          다녀온 행사가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttendedEvents.map((e) => renderEventCard(e, "attended"))}
        </div>
      )}
    </>,
  );
}
