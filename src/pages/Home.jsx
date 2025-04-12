import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { Modal } from "../components/Modal";
import { EventCarousel } from "../components/EventCarousel";
import { formatDate } from "../utils/dateUtils";
import { getThisWeeksEvents } from "../utils/dateUtils";
import { FORM_URL } from "../constants";
import { GenreTag } from "../components/common/GenreTag";
import { LocationLink } from "../components/common/LocationLink";

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

const EventTable = ({ events, title, className = "", onEventSelect }) => (
    <div className={`overflow-x-hidden rounded-lg shadow ${className}`}>
        <table className="min-w-full table-auto">
            <thead className="bg-gray-900">
                <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300">
                    <th>이벤트명</th>
                    <th className="hidden lg:table-cell">장르</th>
                    <th className="hidden lg:table-cell">장소</th>
                    <th>일정</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {events.map(item => (
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
                        <td>{formatDate(item.schedule, item.time_start)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmed, setShowConfirmed] = useState(true);
    const [activeTab, setActiveTab] = useState("current");

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

    const processData = data => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return data
            .filter(item => item.confirm === showConfirmed)
            .map(item => ({
                ...item,
                scheduleDate: new Date(item.schedule),
                isPast: new Date(item.schedule) < today,
            }));
    };

    const filteredData = processData(data);
    const thisWeeksEvents = getThisWeeksEvents(data);
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
                                />
                            ) : (
                                <EventTable
                                    events={pastEvents}
                                    title="종료된 이벤트"
                                    className="opacity-70"
                                    onEventSelect={setSelectedItem}
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
