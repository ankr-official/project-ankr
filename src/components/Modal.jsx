import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  CalendarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";
import { toast } from "react-toastify";
import { addToGoogleCalendar } from "../utils/calendarUtils";
import { useAuth } from "../contexts/AuthContext";
import EditRequestModal from "./EditRequestModal";
import { ref, push, get, set } from "firebase/database";
import { database } from "../config/firebase";

// Custom hooks
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

const useModalBodyLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.dataset.scrollY = scrollY;
      document.body.style.setProperty("--scroll-y", `-${scrollY}px`);
      document.body.style.setProperty(
        "--scrollbar-width",
        `${scrollbarWidth}px`,
      );
      document.body.classList.add("modal-open");

      return () => {
        const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("--scroll-y");
        document.body.style.removeProperty("--scrollbar-width");
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Sub-components
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

const EventInfo = ({ data, isMobile }) => (
  <motion.div
    className={`grid ${data.time_start ? "grid-cols-2" : ""} gap-6 mb-6 ${
      isMobile
        ? "bg-gray-100 dark:bg-gray-800 p-4 rounded-xl"
        : "bg-gray-100 dark:bg-gray-800 rounded-lg"
    } transition-colors`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <div>
      <div className="py-2 space-y-2 text-gray-700 dark:text-gray-300 transition-colors">
        <div className="flex flex-col md:flex-row">
          <div
            className={`p-2 font-medium ${data.time_start ? "w-full" : "md:w-48"}`}
          >
            일정
          </div>
          <div className="w-full p-2 text-center md:text-left">
            {formatDate(data.schedule)}
          </div>
        </div>
        <div className="flex flex-col md:flex-row">
          <div
            className={`p-2 font-medium ${data.time_start ? "w-full" : "md:w-48"}`}
          >
            장르
          </div>
          <div className="p-2 m-auto w-fit md:w-full">
            <GenreTag genre={data.genre} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row">
          <div
            className={`p-2 font-medium ${data.time_start ? "w-full" : "md:w-48"}`}
          >
            장소
          </div>
          <div className="min-w-0 overflow-hidden w-full p-2 text-center lg:text-left">
            <LocationLink location={data.location} />
          </div>
        </div>
      </div>
    </div>
    {data.time_start && (
      <div>
        <div className="py-2 space-y-2 text-gray-700 dark:text-gray-300 transition-colors">
          {data.time_entrance && (
            <div className="flex flex-col md:flex-row">
              <div className="w-full p-2 font-medium">입장</div>
              <div className="w-full p-2">{formatTime(data.time_entrance)}</div>
            </div>
          )}
          <div className="flex flex-col md:flex-row">
            <div className="w-full p-2 font-medium">시작</div>
            <div className="w-full p-2">{formatTime(data.time_start)}</div>
          </div>
          {data.time_end && (
            <div className="flex flex-col md:flex-row">
              <div className="w-full p-2 font-medium">종료</div>
              <div className="w-full p-2">{formatTime(data.time_end)}</div>
            </div>
          )}
        </div>
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
        className="text-blue-600 dark:text-blue-300 break-all lg:hover:text-blue-500 dark:lg:hover:text-blue-100 lg:hover:underline transition-colors"
      >
        {eventUrl}
      </a>
      <ClipboardDocumentListIcon
        onClick={() => {
          navigator.clipboard.writeText(eventUrl);
          toast.info("URL이 복사되었습니다!");
        }}
        className="hidden w-5 h-5 p-0 ml-2 text-indigo-600 dark:text-indigo-200 lg:hover:text-indigo-800 dark:lg:hover:text-gray-100 hover:cursor-pointer lg:block transition-colors"
        aria-label="Copy URL"
      />
    </div>
  </div>
);

const ActionButtons = ({ data }) => {
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
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-indigo-600 rounded lg:w-fit lg:hover:bg-indigo-700"
      >
        <CalendarIcon className="w-5 h-5 mr-2" />
        Google Calendar에 추가
      </button>
      <button
        onClick={handleTwitterShare}
        className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-500 rounded lg:w-fit lg:hover:bg-blue-600"
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
  isMobile,
  onEditRequest,
  isLoggedIn,
}) => (
  <>
    <motion.div
      className={`${isMobile ? "px-4 py-4" : "px-8 py-8 bg-gray-200 dark:bg-gray-900 md:p-12 transition-colors"}`}
      layoutId={`modal-content-${data.id}`}
    >
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white transition-colors truncate min-w-0"
          layoutId={`title-${data.id}`}
        >
          {data.event_name}
        </motion.h2>
        <div className="flex items-center gap-2">
          {isLoggedIn && !isMobile && (
            <button
              onClick={onEditRequest}
              title="정보 수정 요청"
              className="p-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full lg:hover:text-indigo-600 lg:hover:bg-indigo-100 dark:lg:hover:text-indigo-300 dark:lg:hover:bg-indigo-900/40 transition-colors flex px-2 gap-1"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>수정 요청</span>
            </button>
          )}
          {!isMobile && (
            <button
              onClick={onClose}
              className="p-1 text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-800 rounded-full lg:hover:text-white lg:hover:bg-indigo-600 dark:lg:hover:text-indigo-900 dark:lg:hover:bg-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {data.img_url && (
        <EventImage imgUrl={data.img_url} eventName={data.event_name} />
      )}
      <EventInfo data={data} isMobile={isMobile} />

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
        <ActionButtons data={data} />
      </motion.div>
    </motion.div>
  </>
);

const EDIT_DAILY_LIMIT = 10;

export function Modal({
  isOpen,
  onClose,
  data,
  locationSuggestions = [],
  eventNameSuggestions = [],
}) {
  const isMobile = useMobileDetection();
  const { isLoggedIn, user, role } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editRequestCount, setEditRequestCount] = useState(0);
  const isEditLimitReached =
    role !== "admin" && editRequestCount >= EDIT_DAILY_LIMIT;

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
  useModalBodyLock(isOpen);

  // ESC key handler for PC browsers
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen && !isEditOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
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
            className={`fixed inset-0 z-50 flex ${
              isMobile ? "items-end" : "items-center"
            } justify-center ${
              isMobile
                ? "bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-30"
                : "bg-gray-500 dark:bg-gray-500 bg-opacity-50 dark:bg-opacity-50"
            }`}
            onClick={onClose}
          >
            <motion.div
              animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
              transition={
                isMobile
                  ? { type: "spring", damping: 20 }
                  : { type: "spring", duration: 0.5 }
              }
              className={`${
                isMobile
                  ? "w-full h-[80vh] rounded-t-3xl bg-gray-200 dark:bg-gray-900"
                  : "rounded-lg md:max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900"
              } transition-colors`}
              onClick={(e) => e.stopPropagation()}
              style={{ y: isMobile ? dragY : 0 }}
            >
              {isMobile && (
                <div
                  className="relative w-full py-6"
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
                  {isLoggedIn && (
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="absolute p-1 text-indigo-600 dark:text-indigo-300 bg-transparent border-0 top-3 right-6 w-fit transition-colors"
                    >
                      수정 요청
                    </button>
                  )}
                </div>
              )}
              <div
                ref={contentRef}
                className={`${
                  isMobile ? "h-[calc(80vh-4rem)] overflow-y-auto" : "h-full"
                }`}
                onScroll={handleScroll}
              >
                <ModalContent
                  data={data}
                  onClose={onClose}
                  isMobile={isMobile}
                  onEditRequest={() => setIsEditOpen(true)}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
