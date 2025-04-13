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

const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg rounded-b-none transition-colors duration-200 ${
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
        <div className={`relative rounded-lg shadow ${className}`}>
            <table className="min-w-full table-auto min-h-fit">
                <thead className="bg-gray-900">
                    <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300 [&>th]:h-12">
                        <th>이벤트명</th>
                        <th className="hidden lg:table-cell">
                            <div className="relative h-full" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                    className="flex items-center justify-start gap-2 px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <span>장르</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${
                                            isDropdownOpen ? "rotate-180" : ""
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
                                                ...Object.keys(GENRE_COLORS),
                                            ].map(genre => (
                                                <label
                                                    key={genre}
                                                    className="flex items-center px-2 py-1 text-sm text-white hover:bg-gray-700 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGenres.includes(
                                                            genre
                                                        )}
                                                        onChange={() =>
                                                            onGenreChange(genre)
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
                        <th className="hidden lg:table-cell">장소</th>
                        <th>일정</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {events.length > 0 ? (
                        events.map(item => (
                            <tr
                                key={item.id}
                                onClick={() => onEventSelect(item)}
                                className="cursor-pointer lg:hover:bg-gray-700 [&>td]:text-sm [&>td]:font-medium [&>td]:text-gray-300 [&>td]:whitespace-nowrap [&>td]:pl-4 [&>td]:py-4 md:[&>td]:px-6 md:[&>td]:py-4"
                            >
                                <td className="flex items-center">
                                    {item.img_url && (
                                        <img
                                            src={item.img_url}
                                            alt={item.event_name}
                                            className="h-[50px] w-[50px] max-w-[50px] rounded-full mr-3 object-cover"
                                        />
                                    )}
                                    <div className="w-24 overflow-hidden text-left md:w-fit text-ellipsis whitespace-nowrap">
                                        {item.event_name}
                                    </div>
                                </td>
                                <td className="hidden lg:table-cell">
                                    <GenreTag genre={item.genre} />
                                </td>
                                <td className="hidden lg:table-cell">
                                    <LocationLink
                                        location={item.location}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </td>
                                <td>
                                    {formatDate(item.schedule, item.time_start)}
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
    );
};

function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmed, setShowConfirmed] = useState(true);
    const [activeTab, setActiveTab] = useState("current");
    const [selectedGenres, setSelectedGenres] = useState(["all"]);

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

    return (
        <div className="flex flex-col min-h-screen">
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
                            onEventClick={setSelectedItem}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div>
                        <div className="flex space-x-2">
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

                        <div>
                            {activeTab === "current" ? (
                                <EventTable
                                    events={currentEvents}
                                    title="예정된 이벤트"
                                    onEventSelect={setSelectedItem}
                                    selectedGenres={selectedGenres}
                                    onGenreChange={handleGenreChange}
                                />
                            ) : (
                                <EventTable
                                    events={pastEvents}
                                    title="종료된 이벤트"
                                    className="opacity-70"
                                    onEventSelect={setSelectedItem}
                                    selectedGenres={selectedGenres}
                                    onGenreChange={handleGenreChange}
                                />
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center w-full gap-4 mt-8 md:flex-row">
                    <button
                        onClick={() => window.open(FORM_URL, "_blank")}
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded md:w-fit lg:hover:text-indigo-900 lg:hover:bg-white"
                    >
                        행사 등록 신청하기
                    </button>
                </div>
                <Modal
                    isOpen={selectedItem !== null}
                    onClose={() => setSelectedItem(null)}
                    data={selectedItem || {}}
                />
            </div>
        </div>
    );
}

export default Home;
