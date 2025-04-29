import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/dateUtils";

export function EventCarousel({ events, onEventClick }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % events.length);
    };

    const prevSlide = () => {
        setCurrentIndex(
            prevIndex => (prevIndex - 1 + events.length) % events.length
        );
    };

    // 자동 슬라이드 기능
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);
    }, [events.length]);

    if (events.length === 0) return null;

    return (
        <div
            className="relative w-full m-auto mb-8 overflow-hidden rounded-lg cursor-pointer"
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
                        className="absolute inset-0 flex items-center px-20 pb-8"
                    >
                        <div className="flex flex-col items-center w-full md:flex-row">
                            {events[currentIndex].img_url && (
                                <img
                                    src={events[currentIndex].img_url.replace(
                                        /(name=)[^&]*/,
                                        "$1small"
                                    )}
                                    alt={events[currentIndex].event_name}
                                    className="object-cover w-20 h-20 mb-4 rounded-lg md:w-48 md:h-48 md:mb-0"
                                />
                            )}
                            <div className="flex-1 md:ml-8">
                                <h2 className="mb-2 text-2xl font-bold text-white">
                                    {events[currentIndex].event_name}
                                </h2>
                                <p className="mb-2 text-gray-300">
                                    {formatDate(
                                        events[currentIndex].schedule,
                                        events[currentIndex].time_start
                                    )}
                                </p>
                                <p className="text-gray-400">
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
                className="absolute p-2 text-white transform -translate-y-1/2 bg-transparent rounded-full left-4 top-1/2 lg:hover:bg-gray-700"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
                onClick={e => {
                    e.stopPropagation();
                    nextSlide();
                }}
                className="absolute p-2 text-white transform -translate-y-1/2 bg-transparent rounded-full right-4 top-1/2 lg:hover:bg-gray-700"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="flex justify-center p-2 space-x-2">
                {events.map((_, index) => (
                    <button
                        key={index}
                        onClick={e => {
                            e.stopPropagation();
                            setCurrentIndex(index);
                        }}
                        className={`p-0 w-[16px] h-[16px] rounded-full ${
                            index === currentIndex ? "bg-white" : "bg-gray-500"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
