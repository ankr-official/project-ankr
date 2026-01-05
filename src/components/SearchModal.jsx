import { useState, useEffect, useRef } from "react";
import { GenreTag } from "./common/GenreTag";
import { LocationLink } from "./common/LocationLink";
import { formatDate } from "../utils/dateUtils";

export const SearchModal = ({ isOpen, onClose, events, onEventSelect }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const modalRef = useRef(null);
    const inputRef = useRef(null);
    const scrollPosition = useRef(0);
    const touchStartY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            // 현재 스크롤 위치 저장
            scrollPosition.current = window.pageYOffset;

            // iOS Safari를 포함한 모든 모바일 브라우저에서 스크롤 방지
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollPosition.current}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            // 스크롤 위치 복원
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, scrollPosition.current);
        }

        return () => {
            // 컴포넌트 언마운트 시 스타일 초기화
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, scrollPosition.current);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // ESC key handler for PC browsers
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = events.filter(event => {
            const genres =
                event.genre?.split(",").map(g => g.trim().toLowerCase()) || [];
            return (
                event.event_name.toLowerCase().includes(query) ||
                event.location.toLowerCase().includes(query) ||
                genres.some(g => g.includes(query))
            );
        });
        setSearchResults(results);
    }, [searchQuery, events]);

    useEffect(() => {
        const handleTouchStart = e => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = e => {
            const touchY = e.touches[0].clientY;
            const diff = touchStartY.current - touchY;

            // 위로 스크롤할 때만 키보드를 내림
            if (diff > 10) {
                inputRef.current?.blur();
                document.activeElement?.blur();
            }
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener("touchstart", handleTouchStart, {
                passive: true,
            });
            modalElement.addEventListener("touchmove", handleTouchMove, {
                passive: true,
            });
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener(
                    "touchstart",
                    handleTouchStart
                );
                modalElement.removeEventListener("touchmove", handleTouchMove);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-start overflow-hidden bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-50 sm:justify-center sm:pt-16 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="w-full  sm:max-w-3xl h-full sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-800 sm:rounded-lg shadow-xl sm:mx-4 sm:mt-16 flex flex-col transition-colors"
            >
                <div className="sticky top-0 z-10 p-3 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sm:rounded-t-lg sm:p-4 transition-colors">
                    <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="이벤트명, 장소, 장르로 검색..."
                                className="w-full px-4 py-2.5 pl-10 pr-10 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition-colors"
                                enterKeyHint="search"
                            />
                            <svg
                                className="absolute w-5 h-5 text-gray-400 left-3 top-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute p-1 text-gray-700 dark:text-gray-300 transition-colors -translate-y-1/2 bg-gray-300 dark:bg-gray-500 rounded-full right-3 top-1/2 sm:hover:bg-gray-400 dark:sm:hover:bg-gray-600 sm:hover:text-gray-900 dark:sm:hover:text-white active:bg-gray-400 dark:active:bg-gray-600 active:text-gray-900 dark:active:text-white"
                                    title="검색어 지우기"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-gray-900 dark:text-white transition-colors bg-transparent rounded-lg active:bg-gray-200 dark:active:bg-gray-700 sm:hover:bg-gray-200 dark:sm:hover:bg-gray-700"
                            title="닫기"
                        >
                            닫기
                        </button>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto"
                    onTouchStart={e => {
                        if (e.target.closest(".search-result-item")) {
                            inputRef.current?.blur();
                            document.activeElement?.blur();
                        }
                    }}
                >
                    <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
                        {searchResults.length > 0 ? (
                            searchResults.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => {
                                        onEventSelect(event);
                                        onClose();
                                    }}
                                    className="p-3 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer search-result-item sm:p-4 active:bg-gray-200 dark:active:bg-gray-600 sm:hover:bg-gray-200 dark:sm:hover:bg-gray-600"
                                >
                                    <div className="flex items-center space-x-3 text-left sm:space-x-4">
                                        {event.img_url ? (
                                            <img
                                                src={event.img_url.replace(
                                                    /(name=)[^&]*/,
                                                    "$1small"
                                                )}
                                                alt={event.event_name}
                                                className="flex-shrink-0 object-cover w-20 rounded-lg h-28 sm:w-24 sm:h-32"
                                            />
                                        ) : (
                                            <img
                                                src="./dummy.svg"
                                                alt="Dummy"
                                                className="flex-shrink-0 object-cover w-20 rounded-lg h-28 sm:w-24 sm:h-32"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="mb-1.5 sm:mb-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                                {formatDate(
                                                    event.schedule,
                                                    event.time_start
                                                )}
                                            </p>
                                            <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-medium text-gray-900 dark:text-white line-clamp-2 transition-colors">
                                                {event.event_name}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                                <GenreTag genre={event.genre} />
                                            </div>
                                            <LocationLink
                                                location={event.location}
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="p-6 text-center text-gray-600 dark:text-gray-400 sm:p-8 transition-colors">
                                검색 결과가 없습니다.
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-600 dark:text-gray-400 sm:p-8 transition-colors">
                                이벤트를 검색해보세요.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
