import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/dateUtils";

export function EventCarousel({ events, onEventClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoAdvanceTimeout = useRef(null);
  const AUTO_DELAY_MS = 5000;

  const scheduleNextAutoAdvance = () => {
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
    }
    if (events.length > 0) {
      autoAdvanceTimeout.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
      }, AUTO_DELAY_MS);
    }
  };

  const nextSlide = () => {
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
    }
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + events.length) % events.length
    );
  };

  // 자동 슬라이드: 현재 인덱스가 바뀔 때마다 타이머를 재설정하여
  // 사용자 조작 후에도 자연스러운 대기 시간을 보장
  useEffect(() => {
    scheduleNextAutoAdvance();
    return () => {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
    };
  }, [currentIndex, events.length]);

  if (events.length === 0) return null;

  const currentEvent = events[currentIndex];

  return (
    <div
      className="relative m-auto mb-8 w-full max-w-5xl overflow-hidden rounded-lg bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black border dark:border-gray-900 cursor-pointer transition-colors"
      onClick={() => onEventClick(currentEvent)}
    >
      <div className="relative h-32 md:h-60">
        {/* 배경 이미지 - 부드러운 페이드 전환 */}
        <AnimatePresence mode="wait">
          {currentEvent.img_url && (
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              src={currentEvent.img_url.replace(/(name=)[^&]*/, "$1large")}
              alt={currentEvent.event_name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* 어두운 오버레이 (라이트/다크 모드 각각 튜닝) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/80 to-white/40 dark:from-black/85 dark:via-black/60 dark:to-black/40" />

        {/* 내용 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex h-full items-center px-6 md:px-16"
          >
            <div className="w-full text-center md:text-left flex flex-col items-center md:items-start gap-2 md:gap-3">
              {/* 상단 날짜/시간 */}
              <p className="text-xs md:text-sm font-medium dark:text-gray-200/90 tracking-wide">
                {formatDate(currentEvent.schedule, currentEvent.time_start)}
              </p>

              {/* 이벤트 이름 */}
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight  dark:text-white">
                {currentEvent.event_name}
              </h2>

              {/* 장소 정보 */}
              <p className="text-sm md:text-base dark:text-gray-200/80">
                {currentEvent.location}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 좌우 네비게이션 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-4 top-1/2 z-20 p-2 text-gray-900 dark:text-white bg-transparent rounded-full transform -translate-y-1/2 focus:outline-none active:bg-gray-300 dark:active:bg-gray-700 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-4 top-1/2 z-20 p-2 text-gray-900 dark:text-white bg-transparent rounded-full transform -translate-y-1/2 focus:outline-none active:bg-gray-300 dark:active:bg-gray-700 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700 transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* 인디케이터 불릿 - 이 영역 클릭 시 상세 모달이 열리지 않도록 이벤트 버블링 방지 */}
      <div
        className="flex justify-center py-4 space-x-2"
        onClick={(e) => e.stopPropagation()}
      >
        {events.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (autoAdvanceTimeout.current) {
                clearTimeout(autoAdvanceTimeout.current);
              }
              // 현재 활성 불릿을 다시 눌렀을 때는
              // 타이머만 리셋하여 멈추는 느낌을 방지
              if (index === currentIndex) {
                scheduleNextAutoAdvance();
                return;
              }
              setCurrentIndex(index);
            }}
            className={`focus:outline-none p-0 w-[8px] lg:w-[12px] h-[8px] lg:h-[12px] rounded-full transition-colors ${
              index === currentIndex
                ? "bg-gray-900 dark:bg-white"
                : "bg-gray-400 dark:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
