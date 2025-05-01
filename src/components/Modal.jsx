import {
    XMarkIcon,
    ClipboardDocumentListIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useEffect, useState, useRef } from "react";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useModalScroll = onClose => {
    const contentRef = useRef(null);
    const [dragY, setDragY] = useState(0);
    const dragStartY = useRef(0);

    const handleScroll = e => {
        const currentScrollTop = e.target.scrollTop;
        if (currentScrollTop === 0 && e.deltaY < 0) {
            onClose();
        }
    };

    const handleTouchStart = e => {
        if (contentRef.current?.scrollTop === 0) {
            dragStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = e => {
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

const useModalBodyLock = isOpen => {
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            document.body.dataset.scrollY = scrollY;
            document.body.style.setProperty("--scroll-y", `-${scrollY}px`);
            document.body.style.setProperty(
                "--scrollbar-width",
                `${scrollbarWidth}px`
            );
            document.body.classList.add("modal-open");

            return () => {
                const scrollY = parseInt(
                    document.body.dataset.scrollY || "0",
                    10
                );
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
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
};

const ModalContent = ({ data, onClose, isMobile }) => (
    <>
        <ToastContainer
            position="bottom-center"
            autoClose={2000}
            closeOnClick
            hideProgressBar
            theme="dark"
        />
        <motion.div
            className={`${
                isMobile ? "px-4 py-4" : "px-8 py-8 bg-gray-900 md:p-12"
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
                {!isMobile && (
                    <button
                        onClick={onClose}
                        className="p-1 text-indigo-200 bg-indigo-800 rounded-full lg:hover:text-indigo-900 lg:hover:bg-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {data.img_url && (
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <img
                        src={data.img_url.replace(/(name=)[^&]*/, "$1large")}
                        alt={data.event_name}
                        className="object-cover w-full h-auto rounded-lg"
                    />
                </motion.div>
            )}

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
                            <div className="w-full p-2 font-medium">일정</div>
                            <div className="w-full p-2">
                                {formatDate(data.schedule)}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full p-2 font-medium">장르</div>
                            <div className="w-full p-2">
                                <GenreTag genre={data.genre} />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full p-2 font-medium">장소</div>
                            <div className="w-full p-2 text-center lg:text-left">
                                <LocationLink location={data.location} />
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
                                </div>
                                <div className="w-full p-2">
                                    {formatTime(data.time_entrance)}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full p-2 font-medium">시작</div>
                            <div className="w-full p-2">
                                {formatTime(data.time_start)}
                            </div>
                        </div>
                        {data.time_end && (
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full p-2 font-medium">
                                    종료
                                </div>
                                <div className="w-full p-2">
                                    {formatTime(data.time_end)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {data.event_url && (
                    <div className="flex flex-col items-center">
                        <h3 className="mb-2 text-lg font-semibold text-gray-200">
                            이벤트 SNS 링크
                        </h3>
                        <div className="flex flex-col items-center justify-center gap-2 lg:flex-row">
                            <a
                                href={data.event_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 break-all lg:hover:text-blue-100 lg:hover:underline"
                            >
                                {data.event_url}
                            </a>
                            <ClipboardDocumentListIcon
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        data.event_url
                                    );
                                    toast.info("URL이 복사되었습니다!");
                                }}
                                className="hidden w-5 h-5 p-0 ml-2 text-indigo-200 lg:hover:text-gray-100 hover:cursor-pointer lg:block"
                                aria-label="Copy URL"
                            />
                        </div>
                    </div>
                )}

                {data.etc && (
                    <div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-200">
                            기타 정보
                        </h3>
                        <p className="text-gray-300">{data.etc}</p>
                    </div>
                )}

                {/* 트위터 공유 버튼 추가 */}
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            const today = new Date();
                            const eventDate = new Date(data.schedule); // 이벤트 날짜
                            let text;

                            // 이벤트가 과거인지 확인
                            if (eventDate < today) {
                                text = `저는 ${data.location}에서 열린\n${data.event_name} 놀러가봤어요!\n${window.location.href}\n#ANKR_DB`;
                            } else {
                                text = `저는 ${data.location}에서 열리는\n${data.event_name} 놀러가요!\n${window.location.href}\n#ANKR_DB`;
                            }

                            const encodedText = encodeURIComponent(text);
                            const twitterAppUrl = `twitter://post?message=${encodedText}`;
                            const twitterWebUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

                            if (
                                /iPhone|iPad|iPod|Android/i.test(
                                    navigator.userAgent
                                )
                            ) {
                                window.location.href = twitterAppUrl;
                                setTimeout(() => {
                                    window.open(
                                        twitterWebUrl,
                                        "_blank",
                                        "noopener,noreferrer"
                                    );
                                }, 5000);
                            } else {
                                window.open(
                                    twitterWebUrl,
                                    "_blank",
                                    "noopener,noreferrer"
                                );
                            }
                        }}
                        className="flex items-center px-4 py-2 text-white bg-blue-500 rounded lg:hover:bg-blue-600"
                    >
                        <ShareIcon className="w-5 h-5 mr-2" />
                        X(Twitter)에 공유하기
                    </button>
                </div>
            </motion.div>
        </motion.div>
    </>
);

export function Modal({ isOpen, onClose, data }) {
    const isMobile = useMobileDetection();
    const {
        contentRef,
        dragY,
        handleScroll,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    } = useModalScroll(onClose);
    useModalBodyLock(isOpen);

    return (
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
                            ? "bg-black bg-opacity-30"
                            : "bg-gray-500 bg-opacity-50"
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
                                ? "w-full h-[80vh] rounded-t-3xl bg-gray-900"
                                : "rounded-lg md:max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gray-900"
                        }`}
                        onClick={e => e.stopPropagation()}
                        style={{ y: isMobile ? dragY : 0 }}
                    >
                        {isMobile && (
                            <div
                                className="relative w-full py-6"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {isMobile && (
                                    <button
                                        onClick={onClose}
                                        className="absolute p-1 text-indigo-300 bg-transparent border-0 top-3 left-6 w-fit"
                                    >
                                        닫기
                                    </button>
                                )}
                                <div className="w-12 h-1.5 mx-auto bg-gray-300 rounded-full" />
                            </div>
                        )}
                        <div
                            ref={contentRef}
                            className={`${
                                isMobile
                                    ? "h-[calc(80vh-4rem)] overflow-y-auto"
                                    : "h-full"
                            }`}
                            onScroll={handleScroll}
                        >
                            <ModalContent
                                data={data}
                                onClose={onClose}
                                isMobile={isMobile}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
