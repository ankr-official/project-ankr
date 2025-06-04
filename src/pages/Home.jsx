import { useState, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { Modal } from "../components/Modal";
import { EventCarousel } from "../components/EventCarousel";
import { formatDate } from "../utils/dateUtils";
import { getThisWeeksEvents } from "../utils/dateUtils";
import { FORM_URL } from "../constants";
import { GenreTag } from "../components/common/GenreTag";
import { LocationLink } from "../components/common/LocationLink";
import { GENRE_COLORS } from "../constants";
import { HashRouter as Router, useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import EventCalendar from "../components/EventCalendar";

const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full lg:w-fit lg:mb-0 px-4 py-2 text-sm font-medium lg:rounded-t-lg lg:rounded-b-none transition-colors duration-200 ${
            isActive
                ? "text-white bg-indigo-600"
                : "bg-indigo-900 lg:hover:text-gray-300 lg:hover:bg-indigo-700"
        }`}
    >
        {children}
    </button>
);

const EventTable = ({
    events,
    title,
    className = "",
    onEventSelect,
    selectedGenres,
    onGenreChange,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isDropdownOpen]);

    return (
        <div
            className={`relative rounded-lg shadow-none lg:shadow ${className}`}
        >
            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden w-full overflow-x-auto lg:block">
                <table className="min-w-full table-auto min-h-fit">
                    <thead className="bg-gray-900">
                        <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300 [&>th]:h-12">
                            <th className="">이벤트명</th>
                            <th className="">
                                <div
                                    className="relative h-full"
                                    ref={dropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setIsDropdownOpen(!isDropdownOpen)
                                        }
                                        className="flex items-center justify-start gap-2 px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <span>장르</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${
                                                isDropdownOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute z-40 w-48 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                                            <div className="p-2 space-y-1">
                                                {[
                                                    "all",
                                                    ...Object.keys(
                                                        GENRE_COLORS
                                                    ).filter(
                                                        genre =>
                                                            genre !== "default"
                                                    ),
                                                ].map(genre => (
                                                    <label
                                                        key={genre}
                                                        className="flex items-center px-2 py-1 text-sm text-white rounded cursor-pointer hover:bg-gray-700"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedGenres.includes(
                                                                genre
                                                            )}
                                                            onChange={() =>
                                                                onGenreChange(
                                                                    genre
                                                                )
                                                            }
                                                            className="mr-2 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500"
                                                        />
                                                        {genre === "all"
                                                            ? "전체"
                                                            : genre}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="">장소</th>
                            <th>일정</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {events.length > 0 ? (
                            events.map(item => (
                                <tr
                                    key={item.id}
                                    onClick={() => onEventSelect(item)}
                                    className="cursor-pointer hover:bg-gray-700 [&>td]:text-sm [&>td]:font-medium [&>td]:text-gray-300 [&>td]:whitespace-nowrap [&>td]:pl-4 [&>td]:py-4 [&>td]:px-6"
                                >
                                    <td className="flex items-center">
                                        {item.img_url ? (
                                            <img
                                                src={item.img_url.replace(
                                                    /(name=)[^&]*/,
                                                    "$1small"
                                                )}
                                                alt={item.event_name}
                                                className="h-[50px] w-[50px] max-w-[50px] rounded-full mr-3 object-cover"
                                            />
                                        ) : (
                                            <img
                                                src="./dummy.svg"
                                                alt="Dummy"
                                                className="h-[50px] w-[50px] max-w-[50px] rounded-full mr-3 object-cover"
                                            />
                                        )}
                                        <div className="overflow-hidden text-left text-ellipsis whitespace-nowrap">
                                            {item.event_name}
                                        </div>
                                    </td>
                                    <td className="w-[300px]">
                                        <GenreTag genre={item.genre} />
                                    </td>
                                    <td className="w-[300px]">
                                        <LocationLink
                                            location={item.location}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>
                                        {formatDate(
                                            item.schedule,
                                            item.time_start
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="py-8 text-center text-gray-400"
                                >
                                    선택한 장르의 이벤트가 존재하지 않습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {/* 장르 필터 (모바일) */}
                <div className="sticky top-0 z-10 p-2 bg-gray-900 bg-opacity-50 rounded-lg shadow-md backdrop-blur-sm">
                    <div className="flex flex-wrap gap-2">
                        {[
                            "all",
                            ...Object.keys(GENRE_COLORS).filter(
                                genre => genre !== "default"
                            ),
                        ].map(genre => (
                            <button
                                key={genre}
                                onClick={() => onGenreChange(genre)}
                                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                                    selectedGenres.includes(genre)
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                }`}
                            >
                                {genre === "all" ? "전체" : genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 이벤트 카드 목록 */}
                {events.length > 0 ? (
                    events.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onEventSelect(item)}
                            className="p-4 bg-gray-800 rounded-lg shadow cursor-pointer active:bg-indigo-900"
                        >
                            <div className="flex items-center space-x-4">
                                {item.img_url ? (
                                    <img
                                        src={item.img_url.replace(
                                            /(name=)[^&]*/,
                                            "$1small"
                                        )}
                                        alt={item.event_name}
                                        className="flex-shrink-0 object-cover w-24 h-32 rounded-lg"
                                    />
                                ) : (
                                    <img
                                        src="./dummy.svg"
                                        alt="Dummy"
                                        className="flex-shrink-0 object-cover w-24 h-32 rounded-lg"
                                    />
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="mb-2 text-sm text-gray-300">
                                        {formatDate(
                                            item.schedule,
                                            item.time_start
                                        )}
                                    </p>
                                    <h3 className="mb-2 text-base font-medium text-white truncate">
                                        {item.event_name}
                                    </h3>
                                    <div className="mb-2">
                                        <GenreTag genre={item.genre} />
                                    </div>
                                    <div className="">
                                        <LocationLink
                                            location={item.location}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400 bg-gray-800 rounded-lg">
                        선택한 장르의 이벤트가 존재하지 않습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmed, setShowConfirmed] = useState(true);
    const [activeTab, setActiveTab] = useState("current");
    const [selectedGenres, setSelectedGenres] = useState(["all"]);
    const [visiblePastEvents, setVisiblePastEvents] = useState(15);
    const [viewMode, setViewMode] = useState("table");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const match = location.pathname.match(/^\/event\/(.+)/);
        if (match && data.length > 0) {
            const idFromUrl = match[1];
            const item = data.find(d => d.id === idFromUrl);
            if (item && item.confirm) {
                setSelectedItem(item);
            } else {
                setSelectedItem(null);
                navigate("/", { replace: true });
            }
        } else if (!match) {
            setSelectedItem(null);
        }
    }, [location.pathname, data, navigate]);

    useEffect(() => {
        const dataRef = ref(database, "data");
        const unsubscribe = onValue(dataRef, snapshot => {
            const fetchedData = [];
            snapshot.forEach(childSnapshot => {
                fetchedData.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val(),
                });
            });
            setData(fetchedData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleGenreChange = genre => {
        if (genre === "all") {
            setSelectedGenres(["all"]);
            return;
        }

        setSelectedGenres(prev => {
            const newGenres = prev.filter(g => g !== "all");
            if (newGenres.includes(genre)) {
                const updatedGenres = newGenres.filter(g => g !== genre);
                return updatedGenres.length === 0 ? ["all"] : updatedGenres;
            }
            return [...newGenres, genre];
        });
    };

    const processData = data => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return data
            .filter(item => item.confirm === showConfirmed)
            .filter(item => {
                if (selectedGenres.includes("all")) return true;
                if (selectedGenres.length === 1) {
                    return selectedGenres.some(genre =>
                        item.genre.includes(genre)
                    );
                }
                return selectedGenres.every(genre =>
                    item.genre.includes(genre)
                );
            })
            .map(item => ({
                ...item,
                scheduleDate: new Date(item.schedule),
                isPast: new Date(item.schedule) < today,
            }));
    };

    const filteredData = processData(data);
    const thisWeeksEvents = getThisWeeksEvents(data, showConfirmed);
    const currentEvents = filteredData
        .filter(item => !item.isPast)
        .sort((a, b) => a.scheduleDate - b.scheduleDate);
    const pastEvents = filteredData
        .filter(item => item.isPast)
        .sort((a, b) => b.scheduleDate - a.scheduleDate);

    const loadMorePastEvents = () => {
        setVisiblePastEvents(prev => prev + 15);
    };

    const handleModalOpen = item => {
        if (item.confirm) {
            setSelectedItem(item);
            navigate(`/event/${item.id}`, {
                replace: false,
                state: { modal: true },
            });
        }
    };

    const handleModalClose = () => {
        setSelectedItem(null);
        navigate("/");
    };

    return (
        <div className="flex flex-col min-h-screen">
            {selectedItem && (
                <Modal
                    isOpen={selectedItem !== null}
                    onClose={handleModalClose}
                    data={selectedItem || {}}
                />
            )}
            <div className="container flex-grow px-4 py-8 mx-auto">
                <div className="flex flex-col items-center justify-between px-6 mb-6 border-b border-gray-700">
                    <div className="flex items-center justify-center mb-4">
                        <h1 className="text-2xl font-bold md:text-3xl">
                            한국 서브컬쳐 DJ 이벤트 DB
                        </h1>
                    </div>
                </div>

                {!loading && thisWeeksEvents.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-gray-200">
                            가까운 이벤트
                        </h2>
                        <EventCarousel
                            events={thisWeeksEvents}
                            onEventClick={handleModalOpen}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-b-2 border-indigo-700 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div>
                        <div
                            className={`flex flex-col-reverse lg:mb-0 lg:flex-row lg:items-end ${viewMode === "calendar" ? "justify-end" : "justify-between"}`}
                        >
                            <div
                                className={`flex space-x-2 mb-4 lg:mb-0 ${viewMode === "calendar" ? "hidden" : ""}`}
                            >
                                <TabButton
                                    isActive={activeTab === "current"}
                                    onClick={() => setActiveTab("current")}
                                >
                                    예정된 이벤트
                                </TabButton>
                                <TabButton
                                    isActive={activeTab === "past"}
                                    onClick={() => setActiveTab("past")}
                                >
                                    종료된 이벤트
                                </TabButton>
                            </div>
                            <div className="flex mb-4 space-x-2">
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === "table"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-800 text-gray-300 lg:hover:bg-gray-700"
                                    }`}
                                >
                                    테이블
                                </button>
                                <button
                                    onClick={() => setViewMode("calendar")}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === "calendar"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-800 text-gray-300 lg:hover:bg-gray-700"
                                    }`}
                                >
                                    캘린더
                                </button>
                            </div>
                        </div>

                        <div>
                            {viewMode === "table" ? (
                                activeTab === "current" ? (
                                    <EventTable
                                        events={currentEvents}
                                        title="예정된 이벤트"
                                        onEventSelect={handleModalOpen}
                                        selectedGenres={selectedGenres}
                                        onGenreChange={handleGenreChange}
                                    />
                                ) : (
                                    <div>
                                        <EventTable
                                            events={pastEvents.slice(
                                                0,
                                                visiblePastEvents
                                            )}
                                            title="종료된 이벤트"
                                            className="opacity-70"
                                            onEventSelect={handleModalOpen}
                                            selectedGenres={selectedGenres}
                                            onGenreChange={handleGenreChange}
                                        />
                                        {visiblePastEvents <
                                            pastEvents.length && (
                                            <button
                                                onClick={loadMorePastEvents}
                                                className="w-full px-4 py-2 mt-4 text-white bg-gray-900 border border-gray-700 rounded hover:bg-gray-700"
                                            >
                                                더보기
                                            </button>
                                        )}
                                    </div>
                                )
                            ) : (
                                <EventCalendar
                                    events={[...currentEvents, ...pastEvents]}
                                    onEventSelect={handleModalOpen}
                                    selectedGenres={selectedGenres}
                                    onGenreChange={handleGenreChange}
                                />
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center w-full gap-4 mt-16 md:flex-row">
                    <button
                        onClick={() => window.open(FORM_URL, "_blank")}
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded md:w-fit lg:hover:text-indigo-900 lg:hover:bg-white"
                    >
                        행사 제보하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
