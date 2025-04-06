import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
const formatDate = dateString => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = days[date.getDay()];
        return `${date.toISOString().split("T")[0]} (${dayOfWeek})`; // YYYY-MM-DD (요일) 형식
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
        return `${ampm} ${formattedTime}`; // HH:MM (오전/오후) 형식
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
                    className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <motion.div
                            className="p-12 bg-gray-900"
                            layoutId={`modal-content-${data.id}`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <motion.h2
                                    className="text-2xl font-bold text-white"
                                    layoutId={`title-${data.id}`}
                                >
                                    {data.event_name}
                                </motion.h2>
                                <button
                                    onClick={onClose}
                                    className="bg-indigo-800 text-indigo-200 hover:text-indigo-900 hover:bg-white rounded-full p-1"
                                >
                                    <XMarkIcon className="h-6 w-6" />
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
                                        className="w-full h-auto object-cover rounded-lg"
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
                                    <div className="space-y-2 text-gray-300 py-2">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="font-medium w-full p-2">
                                                장르
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {data.genre}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="font-medium w-full p-2">
                                                장소
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {data.location}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="font-medium w-full p-2">
                                                일정
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {formatDate(data.schedule)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="space-y-2 text-gray-300 py-2">
                                        {data.time_entrance && (
                                            <div className="flex flex-col md:flex-row">
                                                <div className="font-medium w-full p-2">
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
                                            <div className="font-medium w-full p-2">
                                                시작
                                            </div>{" "}
                                            <div className="w-full p-2">
                                                {formatTime(data.time_start)}
                                            </div>
                                        </div>
                                        {data.time_end && (
                                            <div className="flex flex-col md:flex-row">
                                                <div className="font-medium w-full p-2">
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
                                        <h3 className="text-lg font-semibold mb-2 text-gray-200">
                                            이벤트 SNS 링크
                                        </h3>
                                        <a
                                            href={data.event_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 hover:text-blue-100 hover:underline break-all"
                                        >
                                            {data.event_url}
                                        </a>
                                    </div>
                                )}

                                {data.etc && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-200">
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
        <div className="min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="flex justify-between items-center px-6 mb-6 flex-col md:flex-row">
                    <div className="flex justify-center items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            한국 서브컬쳐 DJ 이벤트 DB
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPastEvents(!showPastEvents)}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:text-gray-900 hover:bg-white"
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
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:text-gray-900 hover:bg-white"
                        >
                            행사 등록 신청하기
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-900">
                                <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300">
                                    <th>이벤트명</th>
                                    <th>장르</th>
                                    <th>장소</th>
                                    <th>일정</th>
                                    <th>상세정보</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {filteredAndSortedData.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`cursor-pointer hover:bg-gray-700 [&>td]:text-sm [&>td]:font-medium [&>td]:text-gray-300 [&>td]:whitespace-nowrap [&>td]:px-6 [&>td]:py-4 ${
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
                                                    className="h-[50px] w-[50px] rounded-full mr-3 object-cover"
                                                />
                                            )}
                                            <div>{item.event_name}</div>
                                        </td>
                                        <td>{item.genre}</td>
                                        <td>{item.location}</td>
                                        <td>{formatDate(item.schedule)}</td>
                                        <td className="text-sm">
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(item)
                                                }
                                                className="text-white bg-indigo-600 hover:text-indigo-900 hover:bg-white px-4 py-2 rounded"
                                            >
                                                상세보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
