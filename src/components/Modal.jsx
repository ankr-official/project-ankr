import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  CalendarIcon,
  PencilSquareIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "../hooks/useScrollLock";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";
import { toast } from "react-toastify";
import { addToGoogleCalendar } from "../utils/calendarUtils";
import { useAuth } from "../contexts/AuthContext";
import { useLoginDropdown } from "../contexts/LoginDropdownContext";
import EditRequestModal from "./EditRequestModal";
import LoginDropdown from "./LoginDropdown";
import { HeartButton } from "./common/HeartButton";
import { ref, push, get, set } from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { isoToTime, isoToLocal } from "../utils/eventFormUtils";
import { database, functions } from "../config/firebase";

const recordViewFn = httpsCallable(functions, "recordView");

const useModalScroll = (onClose) => {
  const contentRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);

  const handleScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;
    if (currentScrollTop === 0 && e.deltaY < 0) {
      onClose();
    }
  };

  const handleTouchStart = (e) => {
    if (contentRef.current?.scrollTop === 0) {
      dragStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (contentRef.current?.scrollTop === 0) {
      const deltaY = e.touches[0].clientY - dragStartY.current;
      if (deltaY > 0) {
        setDragY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return {
    contentRef,
    dragY,
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// Sub-components
const FieldRow = ({ label, children }) => (
  <div className="flex flex-col items-center lg:flex-row">
    <span className="p-2 font-medium text-gray-500 dark:text-gray-400 lg:w-20 lg:shrink-0">
      {label}
    </span>
    <div className="p-2 w-full text-center">{children}</div>
  </div>
);

const EventImage = ({ imgUrl, eventName }) => (
  <motion.div
    className="mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <img
      src={imgUrl.replace(/(name=)[^&]*/, "$1large")}
      alt={eventName}
      className="object-cover w-full h-auto rounded-lg"
    />
  </motion.div>
);

const EventInfo = ({ data }) => (
  <motion.div
    className={`grid ${data.time_start ? "grid-cols-2" : ""} gap-6 mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl lg:rounded-lg lg:p-0 transition-colors`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <div className="py-2 space-y-2 text-gray-700 dark:text-gray-300 transition-colors">
      <FieldRow label="일정">{formatDate(data.schedule)}</FieldRow>
      <FieldRow label="장르">
        <GenreTag genre={data.genre} className="justify-center" />
      </FieldRow>
      <FieldRow label="장소">
        <LocationLink location={data.location} />
      </FieldRow>
    </div>
    {data.time_start && (
      <div className="py-2 space-y-2 text-gray-700 dark:text-gray-300 transition-colors">
        {data.time_entrance && (
          <FieldRow label="입장">{formatTime(data.time_entrance)}</FieldRow>
        )}
        <FieldRow label="시작">{formatTime(data.time_start)}</FieldRow>
        {data.time_end && (
          <FieldRow label="종료">{formatTime(data.time_end)}</FieldRow>
        )}
      </div>
    )}
  </motion.div>
);

const EventUrl = ({ eventUrl }) => (
  <div className="flex flex-col items-center">
    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors">
      이벤트 SNS 링크
    </h3>
    <div className="flex flex-col items-center justify-center gap-2 lg:flex-row">
      <a
        href={eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-300 break-all active:text-blue-500 mouse:hover:text-blue-500 dark:active:text-blue-100 dark:mouse:hover:text-blue-100 active:underline mouse:hover:underline transition-colors"
      >
        {eventUrl}
      </a>
      <ClipboardDocumentListIcon
        onClick={() => {
          navigator.clipboard.writeText(eventUrl);
          toast.info("URL이 복사되었습니다!");
        }}
        className="hidden w-5 h-5 p-0 ml-2 text-indigo-600 dark:text-indigo-200 active:text-indigo-800 mouse:hover:text-indigo-800 dark:active:text-gray-100 dark:mouse:hover:text-gray-100 hover:cursor-pointer lg:block transition-colors"
        aria-label="Copy URL"
      />
    </div>
  </div>
);

const ShareButtons = ({ data }) => {
  const handleTwitterShare = () => {
    const today = new Date();
    const eventDate = new Date(data.schedule);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const eventDateOnly = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );

    let text;
    if (eventDateOnly > todayDate) {
      text = `${data.location}에서 열리는 ${data.event_name} 놀러가요!\n${window.location.href}\n#ANKR_DB`;
    } else if (eventDateOnly < todayDate) {
      text = `${data.location}에서 ${data.event_name} 있었어요!\n${window.location.href}\n#ANKR_DB`;
    } else {
      text = `오늘은 ${data.location}에서 ${data.event_name} 있어요!\n${window.location.href}\n#ANKR_DB`;
    }

    const encodedText = encodeURIComponent(text);
    const twitterAppUrl = `twitter://post?message=${encodedText}`;
    const twitterWebUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = twitterAppUrl;
      setTimeout(() => {
        window.open(twitterWebUrl, "_blank", "noopener,noreferrer");
      }, 5000);
    } else {
      window.open(twitterWebUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 pt-4 lg:flex-row lg:justify-center">
      <button
        onClick={() => addToGoogleCalendar(data)}
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-indigo-600 rounded lg:w-fit active:bg-indigo-700 mouse:hover:bg-indigo-700"
      >
        <CalendarIcon className="w-5 h-5 mr-2" />
        Google Calendar에 추가
      </button>
      <button
        onClick={handleTwitterShare}
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-500 rounded lg:w-fit active:bg-blue-600 mouse:hover:bg-blue-600"
      >
        <ShareIcon className="w-5 h-5 mr-2" />
        X(Twitter)에 공유하기
      </button>
    </div>
  );
};

const ModalContent = ({
  data,
  onClose,
  onEditRequest,
  showLogin,
  onCloseLogin,
  viewCount,
}) => (
  <motion.div
    className="px-4 py-4 lg:px-8 lg:py-8 transition-colors"
    layoutId={`modal-content-${data.id}`}
  >
    <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
      <div className="min-w-0">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white transition-colors truncate"
          layoutId={`title-${data.id}`}
        >
          {data.event_name}
        </motion.h2>
        <div className="flex items-center gap-1 mt-0.5 ml-0.5 text-xs text-gray-400 dark:text-gray-500">
          <EyeIcon className="w-3.5 h-3.5" />
          <span>
            {viewCount !== null ? `${viewCount.toLocaleString()}회` : "—"}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="hidden lg:flex p-1 w-8 h-8 items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>

    {data.img_url && (
      <EventImage imgUrl={data.img_url} eventName={data.event_name} />
    )}
    <EventInfo data={data} />

    <div className="hidden lg:flex items-center justify-center gap-3 mb-6">
      <HeartButton
        eventId={data.id}
        eventDate={data.schedule}
        label="관심 행사"
        buttonClassName="p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors flex px-4 gap-1"
      />
      <div className="relative">
        <button
          onClick={onEditRequest}
          className="p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors flex px-4 gap-1"
        >
          <PencilSquareIcon className="w-5 h-5" />
          <span>수정 요청</span>
        </button>
        {showLogin && (
          <LoginDropdown
            position="bottom"
            align="left"
            onClose={onCloseLogin}
          />
        )}
      </div>
    </div>

    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {data.event_url && <EventUrl eventUrl={data.event_url} />}
      {data.etc && (
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors">
            기타 정보
          </h3>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            {data.etc}
          </p>
        </div>
      )}
      <ShareButtons data={data} />
    </motion.div>
  </motion.div>
);

const EDIT_DAILY_LIMIT = 10;

export function Modal({
  isOpen,
  onClose,
  data,
  locationSuggestions = [],
  eventNameSuggestions = [],
  genreSuggestions = [],
}) {
  const { isLoggedIn, user, role } = useAuth();
  const { activeLoginId, openLoginDropdown, closeLoginDropdown } =
    useLoginDropdown();
  const showLogin = activeLoginId === "modal-edit";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editRequestCount, setEditRequestCount] = useState(0);
  const [viewCount, setViewCount] = useState(null);
  const isEditLimitReached =
    role !== "admin" && editRequestCount >= EDIT_DAILY_LIMIT;

  const recordedRef = useRef(null);

  const handleEditRequest = () => {
    if (isLoggedIn) setIsEditOpen(true);
    else openLoginDropdown("modal-edit");
  };

  useEffect(() => {
    if (!isOpen || !data?.id) {
      closeLoginDropdown();
      return;
    }
    if (recordedRef.current === data.id) return;
    recordedRef.current = data.id;

    recordViewFn({ eventId: data.id }).catch(() => {});

    get(ref(database, `data_v2/${data.id}/views`))
      .then((snap) => setViewCount(snap.val() ?? 0))
      .catch(() => {});
  }, [isOpen, data?.id]);

  useEffect(() => {
    if (!user?.uid || role === "admin") return;
    const today = new Date().toISOString().slice(0, 10);
    get(ref(database, `editRequestLimits/${user.uid}`))
      .then((snap) => {
        const val = snap.val();
        setEditRequestCount(val?.date === today ? (val.count ?? 0) : 0);
      })
      .catch(() => setEditRequestCount(0));
  }, [user?.uid, role]);

  const {
    contentRef,
    dragY,
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useModalScroll(onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen && !isEditOpen) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, isEditOpen, onClose]);

  const handleEditSubmit = async (formData, reason) => {
    if (isEditLimitReached) return;
    setIsSavingEdit(true);
    try {
      await push(ref(database, "editRequests"), {
        ...formData,
        eventId: data.id,
        eventName: data.event_name,
        reason,
        submittedAt: new Date().toISOString(),
        submittedBy: user?.email || user?.uid || "unknown",
        _snap: {
          event_name: data.event_name ?? null,
          schedule: isoToLocal(data.schedule) || null,
          location: data.location ?? null,
          genre: data.genre ?? null,
          time_start: isoToTime(data.time_start) || null,
          time_entrance: isoToTime(data.time_entrance) || null,
          time_end: isoToTime(data.time_end) || null,
          event_url: data.event_url ?? null,
          etc: data.etc ?? null,
        },
      });
      const today = new Date().toISOString().slice(0, 10);
      const newCount = editRequestCount + 1;
      await set(ref(database, `editRequestLimits/${user.uid}`), {
        date: today,
        count: newCount,
      });
      setEditRequestCount(newCount);
      setIsEditOpen(false);
      toast.success("요청이 접수되었습니다!");
    } catch {
      toast.error("요청 전송에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <>
      {isEditOpen && (
        <EditRequestModal
          event={data}
          onSubmit={handleEditSubmit}
          onClose={() => setIsEditOpen(false)}
          isSaving={isSavingEdit}
          locationSuggestions={locationSuggestions}
          eventNameSuggestions={eventNameSuggestions}
          genreSuggestions={genreSuggestions}
          isLimitReached={isEditLimitReached}
          requestCount={editRequestCount}
          dailyLimit={EDIT_DAILY_LIMIT}
        />
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{ y: dragY }}
              className="w-full h-[80vh] rounded-t-3xl lg:rounded-lg lg:max-w-3xl lg:h-auto lg:max-h-[90vh] lg:overflow-y-auto bg-gray-200 dark:bg-gray-900 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모바일 드래그 핸들 */}
              <div
                className="lg:hidden relative w-full py-6"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={onClose}
                  className="absolute p-1 text-indigo-600 dark:text-indigo-300 bg-transparent border-0 top-3 left-6 w-fit transition-colors"
                >
                  닫기
                </button>
                <div className="w-12 h-1.5 mx-auto bg-gray-400 dark:bg-gray-300 rounded-full" />
                <div className="absolute top-3 right-6 flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={handleEditRequest}
                      className="p-1 text-indigo-600 dark:text-indigo-300 bg-transparent border-0 w-fit transition-colors"
                    >
                      수정 요청
                    </button>
                    {showLogin && (
                      <LoginDropdown
                        position="bottom"
                        align="right"
                        onClose={closeLoginDropdown}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 스크롤 영역 */}
              <div
                ref={contentRef}
                className="h-[calc(80vh-4rem)] overflow-y-auto lg:h-auto lg:overflow-visible"
                onScroll={handleScroll}
              >
                <ModalContent
                  data={data}
                  onClose={onClose}
                  onEditRequest={handleEditRequest}
                  showLogin={showLogin}
                  onCloseLogin={closeLoginDropdown}
                  viewCount={viewCount}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
