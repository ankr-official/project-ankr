import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useEffect } from "react";

export function Modal({ isOpen, onClose, data }) {
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 md:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="rounded-lg md:max-w-3xl w-full max-h-screen md:max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <motion.div
                            className="px-8 py-8 bg-gray-900 md:p-12"
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
                                    className="p-1 text-indigo-200 bg-indigo-800 rounded-full lg:hover:text-indigo-900 lg:hover:bg-white"
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
                                className="grid grid-cols-2 gap-6 mb-6 bg-gray-800 rounded-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div>
                                    <div className="py-2 space-y-2 text-gray-300">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                장르
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {data.genre}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                장소
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {data.location}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full p-2 font-medium">
                                                일정
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {formatDate(data.schedule)}
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
