import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useEffect, useState } from "react";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";

export function Modal({ isOpen, onClose, data }) {
    const [isMobile, setIsMobile] = useState(false);
    const dragControls = useDragControls();
    const [dragY, setDragY] = useState(0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 flex items-center justify-center ${
                        isMobile
                            ? "bg-black bg-opacity-30"
                            : "bg-gray-500 bg-opacity-50"
                    }`}
                    onClick={onClose}
                >
                    <motion.div
                        initial={
                            isMobile
                                ? { y: "100%" }
                                : { scale: 0.9, opacity: 0, y: 20 }
                        }
                        animate={
                            isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }
                        }
                        exit={
                            isMobile
                                ? { y: "100%" }
                                : { scale: 0.9, opacity: 0, y: 20 }
                        }
                        transition={
                            isMobile
                                ? { type: "spring", damping: 20 }
                                : { type: "spring", duration: 0.5 }
                        }
                        className={`${
                            isMobile
                                ? "w-full h-[90vh] rounded-t-3xl bg-gray-900 overflow-hidden"
                                : "rounded-lg md:max-w-3xl w-full max-h-screen md:max-h-[90vh] overflow-y-auto"
                        }`}
                        onClick={e => e.stopPropagation()}
                        drag={isMobile ? "y" : false}
                        dragConstraints={isMobile ? { top: 0 } : false}
                        dragElastic={isMobile ? 0.1 : 0}
                        onDragEnd={handleDragEnd}
                        dragControls={dragControls}
                        style={{ y: isMobile ? dragY : 0 }}
                    >
                        {isMobile && (
                            <div className="w-full p-4">
                                <div className="w-12 h-1 mx-auto bg-gray-700 rounded-full" />
                            </div>
                        )}
                        <motion.div
                            className={`${
                                isMobile
                                    ? "px-4 py-4"
                                    : "px-8 py-8 bg-gray-900 md:p-12"
                            }`}
                            layoutId={`modal-content-${data.id}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <motion.h2
                                    className="text-2xl font-bold text-white"
                                    layoutId={`title-${data.id}`}
                                >
                                    {data.event_name}
                                </motion.h2>
                                <button
                                    onClick={onClose}
                                    className={`${
                                        isMobile
                                            ? "hidden"
                                            : "p-1 text-indigo-200 bg-indigo-800 rounded-full lg:hover:text-indigo-900 lg:hover:bg-white"
                                    }`}
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* 이미지 섹션 */}
                            {data.img_url && (
                                <motion.div
                                    className="mb-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <img
                                        src={data.img_url}
                                        alt={data.event_name}
                                        className="object-cover w-full h-auto rounded-lg"
                                    />
                                </motion.div>
                            )}

                            {/* 기본 정보 섹션 */}
                            <motion.div
                                className={`grid grid-cols-2 gap-6 mb-6 ${
                                    isMobile
                                        ? "bg-gray-800 p-4 rounded-xl"
                                        : "bg-gray-800 rounded-lg"
                                }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div>
                                    <div className="py-2 space-y-2 text-gray-300">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                일정
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {formatDate(data.schedule)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                장르
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                <GenreTag genre={data.genre} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                장소
                                            </div>{" "}
                                            <div className="w-full p-2 text-center lg:text-left">
                                                <LocationLink
                                                    location={data.location}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="py-2 space-y-2 text-gray-300">
                                        {data.time_entrance && (
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full p-2 font-medium">
                                                    입장
                                                </div>{" "}
                                                <div className="w-full p-2">
                                                    {formatTime(
                                                        data.time_entrance
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                시작
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {formatTime(data.time_start)}
                                            </div>
                                        </div>
                                        {data.time_end && (
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full p-2 font-medium">
                                                    종료
                                                </div>{" "}
                                                <div className="w-full p-2">
                                                    {formatTime(data.time_end)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* 추가 정보 섹션 */}
                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {data.event_url && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-200">
                                            이벤트 SNS 링크
                                        </h3>
                                        <a
                                            href={data.event_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 break-all lg:hover:text-blue-100 lg:hover:underline"
                                        >
                                            {data.event_url}
                                        </a>
                                    </div>
                                )}

                                {data.etc && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-200">
                                            기타 정보
                                        </h3>
                                        <p className="text-gray-300">
                                            {data.etc}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
