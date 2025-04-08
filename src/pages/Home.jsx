import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// Firebase 설정
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 날짜 포맷팅 유틸리티 함수들
const formatDate = (dateString, timeStart) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1); // Subtract one day
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        let dayIndex = date.getDay();
        dayIndex = (dayIndex - 1 + 7) % 7; // Subtract one day and handle negative values
        const dayOfWeek = days[dayIndex];

        // time_start가 있는 경우에만 시간 정보 추가
        if (timeStart) {
            const startTime = new Date(timeStart);
            const hours = startTime.getHours();
            const timeType = hours >= 6 && hours < 18 ? "☀️" : "🌙"; // 06:00~17:59는 낮, 나머지는 심야
            return `${date.toISOString().split("T")[0]} (${dayOfWeek}) ${timeType}`;
        }

        return `${date.toISOString().split("T")[0]} (${dayOfWeek})`;
    } catch (e) {
        return dateString;
    }
};

const formatTime = dateString => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - 5);
        const hours = date.getHours();
        const ampm = hours < 12 ? "AM" : "PM";
        const formattedTime = date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${ampm} ${formattedTime}`; // [낮/심야] HH:MM (오전/오후) 형식
    } catch (e) {
        return dateString;
    }
};

function Modal({ isOpen, onClose, data }) {
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
                                    className="p-1 text-indigo-200 bg-indigo-800 rounded-full hover:text-indigo-900 hover:bg-white"
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
                                            className="text-blue-300 break-all hover:text-blue-100 hover:underline"
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

// 가까운 이벤트 필터링 함수
const getThisWeeksEvents = data => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return data
        .filter(item => {
            const eventDate = new Date(item.schedule);
            return eventDate >= today && eventDate < nextWeek;
        })
        .sort((a, b) => new Date(a.schedule) - new Date(b.schedule)); // 날짜순 정렬
};

function EventCarousel({ events, onEventClick }) {
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
    }, [events.length]); // events.length가 변경될 때마다 interval 재설정

    if (events.length === 0) return null;

    return (
        <div
            className="relative w-full m-auto mb-8 overflow-hidden bg-gray-800 rounded-lg cursor-pointer"
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
                                    src={events[currentIndex].img_url}
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
                className="absolute p-2 text-white transform -translate-y-1/2 bg-gray-900 rounded-full left-4 top-1/2 hover:bg-gray-700"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
                onClick={e => {
                    e.stopPropagation();
                    nextSlide();
                }}
                className="absolute p-2 text-white transform -translate-y-1/2 bg-gray-900 rounded-full right-4 top-1/2 hover:bg-gray-700"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="absolute left-0 right-0 flex justify-center p-2 space-x-2 bottom-2">
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

function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmed, setShowConfirmed] = useState(true);
    const [showPastEvents, setShowPastEvents] = useState(false);

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

    // 가까운 이벤트
    const thisWeeksEvents = getThisWeeksEvents(data);

    // 날짜 기준 정렬 및 과거 이벤트 체크를 위한 함수
    const processData = data => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시점으로 설정

        return data
            .map(item => ({
                ...item,
                scheduleDate: new Date(item.schedule),
                isPast: new Date(item.schedule) < today,
            }))
            .sort((a, b) => b.scheduleDate - a.scheduleDate); // 날짜 내림차순 정렬
    };

    // confirm 상태에 따라 데이터 필터링 및 정렬
    const filteredAndSortedData = processData(
        data.filter(item => item.confirm === showConfirmed)
    );

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

                {/* 가까운 이벤트 Carousel */}
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
                    <div className="overflow-x-hidden rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-900">
                                <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300">
                                    <th>이벤트명</th>
                                    <th className="hidden lg:table-cell">
                                        장르
                                    </th>
                                    <th className="hidden lg:table-cell">
                                        장소
                                    </th>
                                    <th>일정</th>
                                    {/* <th className="hidden md:table-cell">
                                        상세정보
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {filteredAndSortedData.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`cursor-pointer hover:bg-gray-700 [&>td]:text-sm [&>td]:font-medium [&>td]:text-gray-300 [&>td]:whitespace-nowrap [&>td]:pl-4 [&>td]:py-4 md:[&>td]:px-6 md:[&>td]:py-4 ${
                                            item.isPast && !showPastEvents
                                                ? "hidden"
                                                : item.isPast
                                                  ? "opacity-30 hover:bg-gray-800"
                                                  : ""
                                        }`}
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
                                            {item.genre}
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            {item.location}
                                        </td>
                                        <td>
                                            {formatDate(
                                                item.schedule,
                                                item.time_start
                                            )}
                                        </td>
                                        {/* <td className="hidden text-sm md:table-cell">
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(item)
                                                }
                                                className="px-4 py-2 text-white bg-indigo-600 rounded hover:text-indigo-900 hover:bg-white"
                                            >
                                                상세보기
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex flex-col items-center justify-center w-full gap-4 mt-8 md:flex-row">
                    <button
                        onClick={() => setShowPastEvents(!showPastEvents)}
                        className="w-full px-4 py-2 text-white bg-gray-600 rounded md:w-fit hover:text-gray-900 hover:bg-white"
                    >
                        {showPastEvents
                            ? "과거 이벤트 숨기기"
                            : "과거 이벤트 보기"}
                    </button>
                    <button
                        onClick={() =>
                            window.open(
                                "https://docs.google.com/forms/u/0/d/e/1FAIpQLScfgviSghF4mRqCmqCZr2M6X8fpd70T6s8j62OhgdlwY6590Q/formResponse",
                                "_blank"
                            )
                        }
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded md:w-fit hover:text-indigo-900 hover:bg-white"
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
