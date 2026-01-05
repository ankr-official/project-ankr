import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/dateUtils";

export function EventCarousel({ events, onEventClick }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoAdvanceTimeout = useRef(null);
    const AUTO_DELAY_MS = 3000;

    const scheduleNextAutoAdvance = () => {
        if (autoAdvanceTimeout.current) {
            clearTimeout(autoAdvanceTimeout.current);
        }
        if (events.length > 0) {
            autoAdvanceTimeout.current = setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % events.length);
            }, AUTO_DELAY_MS);
        }
    };

    const nextSlide = () => {
        if (autoAdvanceTimeout.current) {
            clearTimeout(autoAdvanceTimeout.current);
        }
        setCurrentIndex(prevIndex => (prevIndex + 1) % events.length);
    };

    const prevSlide = () => {
        if (autoAdvanceTimeout.current) {
            clearTimeout(autoAdvanceTimeout.current);
        }
        setCurrentIndex(
            prevIndex => (prevIndex - 1 + events.length) % events.length
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

    return (
        <div
            className="overflow-hidden relative m-auto mb-8 w-full rounded-lg cursor-pointer"
            onClick={() => onEventClick(events[currentIndex])}
        >
            <div className="relative h-72">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="flex absolute inset-0 items-center px-20 pb-8"
                    >
                        <div className="flex flex-col items-center w-full md:flex-row">
                            {events[currentIndex].img_url && (
                                <img
                                    src={events[currentIndex].img_url.replace(
                                        /(name=)[^&]*/,
                                        "$1small"
                                    )}
                                    alt={events[currentIndex].event_name}
                                    className="object-cover mb-4 w-20 h-20 rounded-lg md:w-48 md:h-48 md:mb-0"
                                />
                            )}
                            <div className="flex-1 md:ml-8">
                                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                                    {events[currentIndex].event_name}
                                </h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300 transition-colors">
                                    {formatDate(
                                        events[currentIndex].schedule,
                                        events[currentIndex].time_start
                                    )}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 transition-colors">
                                    {events[currentIndex].location}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <button
                onClick={e => {
                    e.stopPropagation();
                    prevSlide();
                }}
                className="absolute left-4 top-1/2 p-2 text-gray-900 dark:text-white bg-transparent rounded-full transform -translate-y-1/2 focus:outline-none active:bg-gray-300 dark:active:bg-gray-700 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700 transition-colors"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
                onClick={e => {
                    e.stopPropagation();
                    nextSlide();
                }}
                className="absolute right-4 top-1/2 p-2 text-gray-900 dark:text-white bg-transparent rounded-full transform -translate-y-1/2 focus:outline-none active:bg-gray-300 dark:active:bg-gray-700 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700 transition-colors"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="flex justify-center p-2 space-x-2">
                {events.map((_, index) => (
                    <button
                        key={index}
                        onClick={e => {
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
                        className={`focus:outline-none p-0 w-[16px] h-[16px] rounded-full transition-colors ${
                            index === currentIndex ? "bg-gray-900 dark:bg-white" : "bg-gray-400 dark:bg-gray-500"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
