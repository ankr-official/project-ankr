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
import { sortByDateTime, formatDate, toKSTDate } from "../utils/dateUtils";
import { useYearEventData } from "../hooks/useYearEventData";
import { EventCard } from "../components/events/EventCard";
import { ImageWithSkeleton } from "../components/common/ImageWithSkeleton";

const isPast = (event) => {
  if (event.time_start) return new Date(event.time_start) < new Date();
  const todayKST = toKSTDate(new Date()).toISOString().slice(0, 10);
  return event.schedule.slice(0, 10) < todayKST;
};

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
    loading: eventsLoading,
  } = useYearEventData();

  useEffect(() => {
    if (!activityData || !knownYears.length) return;
    const allIds = new Set(Object.keys(activityData));
    if (!allIds.size) return;
    const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
    Promise.all(
      knownYears.map(async (year) => {
        if (loadedYears.has(year)) return;
        try {
          const res = await fetch(`${dbUrl}/data_v3/${year}.json?shallow=true`);
          const keys = await res.json();
          if (keys && Object.keys(keys).some((k) => allIds.has(k)))
            loadYear(year);
        } catch {}
      }),
    );
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

  if (!profileLoaded) {
    return shell(
      <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
        불러오는 중...
      </div>,
    );
  }

  if (!profile?.historyPublic) {
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

  const uidSuffix = slugUid
    ? String(
        slugUid
          .split("")
          .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 1000000,
      ).padStart(6, "0")
    : "000000";
  const displayName = profile?.nickname || `익명${uidSuffix}`;
  const dataLoading = !profileLoaded || activityData === null || eventsLoading;

  return shell(
    <>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        {backBtn}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">
          {displayName}님의 활동
        </h1>
        <div className="w-9 h-9 flex-shrink-0" />
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

      {/* 이벤트 목록 */}
      {dataLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">
          불러오는 중...
        </div>
      ) : (
        <>
          {/* 관심 행사 섹션 */}
          <div className="mb-8">
            <div className="border-b pl-2 pb-2 border-b-gray-600/50 dark:border-b-gray-500/50 flex items-center gap-1.5 mb-3">
              <HeartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-md font-medium text-gray-500 dark:text-gray-400">
                관심 행사
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {likedEvents.length}
              </span>
            </div>
            {likedEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                관심 행사가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {likedEvents.filter((e) => !isPast(e)).length > 0 && (
                  <div>
                    <div className="space-y-3">
                      {likedEvents
                        .filter((e) => !isPast(e))
                        .map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onEventSelect={() => navigate(`/event/${event.id}`)}
                            showHeart={false}
                            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow transition-colors cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/40"
                          />
                        ))}
                    </div>
                  </div>
                )}
                {likedEvents.filter((e) => isPast(e)).length > 0 && (
                  <div>
                    <p className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                      지난 행사
                    </p>
                    <div className="space-y-3">
                      {likedEvents
                        .filter((e) => isPast(e))
                        .map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onEventSelect={() => navigate(`/event/${event.id}`)}
                            showHeart={false}
                            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow transition-colors cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/40"
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 다녀온 행사 섹션 */}
          <div>
            <div className="border-b pl-2 pb-2 border-b-gray-600/50 dark:border-b-gray-500/50 flex items-center gap-1.5 mb-3">
              <CheckCircleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-md font-medium text-gray-500 dark:text-gray-400">
                다녀온 행사
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {attendedEvents.length}
              </span>
            </div>
            {attendedEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                다녀온 행사가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-3 ">
                {attendedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="p-0 rounded-none overflow-hidden active:opacity-70 mouse:hover:opacity-80 transition-opacity"
                  >
                    {event.img_url ? (
                      <ImageWithSkeleton
                        src={event.img_url.replace(/(name=)[^&]*/, "$1small")}
                        alt={event.event_name}
                        wrapperClassName="w-full h-full"
                        imgClassName="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src="./dummy.svg"
                          alt=""
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-0.5 px-1">
                          <span className="text-sm text-white/70 font-medium">
                            {formatDate(event.schedule)}
                          </span>
                          <span className="text-md text-white text-center truncate w-full px-2 font-medium">
                            {event.event_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>,
  );
}
