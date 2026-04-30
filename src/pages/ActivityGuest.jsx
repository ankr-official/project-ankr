import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import {
  ArrowLeftIcon,
  HeartIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { database } from "../config/firebase";
import { sortByDateTime } from "../utils/dateUtils";
import { useYearEventData } from "../hooks/useYearEventData";
import { EventCard } from "../components/events/EventCard";

const TABS = [
  { key: "liked", label: "관심 행사", icon: HeartIcon },
  { key: "attended", label: "다녀온 행사", icon: CheckCircleIcon },
];

export default function ActivityGuest() {
  const { handle } = useParams();
  const navigate = useNavigate();

  // /@slug 형식만 허용: handle = "@slug" → slug = "slug"
  const slug = handle?.startsWith("@") ? handle.slice(1) : null;

  const [slugUid, setSlugUid] = useState(null);
  const [slugLookupDone, setSlugLookupDone] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [activeTab, setActiveTab] = useState("liked");

  // Slug 조회
  useEffect(() => {
    if (!slug) return;
    setSlugLookupDone(false);
    setSlugUid(null);
    get(ref(database, `activitySlugs/${slug}`))
      .then((snap) => {
        setSlugUid(snap.val() || null);
        setSlugLookupDone(true);
      })
      .catch(() => setSlugLookupDone(true));
  }, [slug]);

  // 공개 데이터 로드
  useEffect(() => {
    if (!slugLookupDone || !slugUid) return;
    setProfileLoaded(false);
    setActivityData(null);
    Promise.all([
      get(ref(database, `users/${slugUid}/nickname`)),
      get(ref(database, `users/${slugUid}/historyPublic`)),
      get(ref(database, `users/${slugUid}/publicActivity`)).catch(() => null),
    ])
      .then(([nickSnap, pubSnap, actSnap]) => {
        setProfile({
          nickname: nickSnap.val() || null,
          historyPublic: pubSnap.val() ?? false,
        });
        setActivityData(actSnap?.val() || {});
        setProfileLoaded(true);
      })
      .catch(() => {
        setProfile({ nickname: null, historyPublic: false });
        setActivityData({});
        setProfileLoaded(true);
      });
  }, [slugUid, slugLookupDone]);

  const {
    allData: allEvents,
    knownYears,
    loadedYears,
    loadYear,
  } = useYearEventData();

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

  const likedEvents = useMemo(() => {
    if (!allEvents || !activityData) return [];
    const ids = Object.entries(activityData)
      .filter(([, v]) => v === "liked" || v === true)
      .map(([k]) => k);
    return allEvents
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => sortByDateTime(a, b, false));
  }, [allEvents, activityData]);

  const attendedEvents = useMemo(() => {
    if (!allEvents || !activityData) return [];
    const ids = Object.entries(activityData)
      .filter(([, v]) => v === "attended")
      .map(([k]) => k);
    return allEvents
      .filter((e) => ids.includes(e.id))
      .sort((a, b) => sortByDateTime(a, b, true));
  }, [allEvents, activityData]);

  const currentEvents = activeTab === "liked" ? likedEvents : attendedEvents;

  // @ 없는 경로는 Home으로
  if (!slug) return <Navigate to="/" replace />;

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

  if (!slugLookupDone) {
    return shell(
      <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
        불러오는 중...
      </div>,
    );
  }

  if (!slugUid) {
    return shell(
      <>
        <div className="flex items-center gap-3 mb-8">{backBtn}</div>
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            존재하지 않는 페이지입니다.
          </p>
        </div>
      </>,
    );
  }

  if (profileLoaded && !profile?.historyPublic) {
    return shell(
      <>
        <div className="flex items-center gap-3 mb-8">{backBtn}</div>
        <div className="text-center py-16">
          <LockClosedIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            비공개 활동 페이지입니다.
          </p>
        </div>
      </>,
    );
  }

  const displayName = profile?.nickname || "익명";
  const dataLoading = !profileLoaded || activityData === null || !allEvents;

  return shell(
    <>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        {backBtn}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          활동
        </h1>
      </div>

      {/* 프로필 카드 */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-gray-800/60 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              ankr.kr/@{slug}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count =
            key === "liked" ? likedEvents.length : attendedEvents.length;
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
              {!dataLoading && (
                <span className="text-xs opacity-60">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 이벤트 목록 */}
      {dataLoading ? (
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
          {currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEventSelect={() => navigate(`/event/${event.id}`)}
              showHeart={false}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow transition-colors cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/40"
            />
          ))}
        </div>
      )}
    </>,
  );
}
