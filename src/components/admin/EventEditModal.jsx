import { useState, useEffect, useRef } from "react";
import { GENRE_COLORS } from "../../constants";

const GENRES = Object.keys(GENRE_COLORS).filter(g => g !== "default");

const isoToLocal = iso => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (isNaN(d)) return "";
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
        return iso.slice(0, 10);
    }
};

const isoToTime = iso => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (isNaN(d)) return "";
        const pad = n => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return "";
    }
};

const EMPTY_EVENT = {
    event_name: "",
    schedule: "",
    location: "",
    genre: [],
    img_url: "",
    event_url: "",
    time_start: "",
    time_entrance: "",
    time_end: "",
    etc: "",
    confirm: false,
};

const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors appearance-none";

export default function EventEditModal({
    event,
    onSave,
    onClose,
    isSaving,
    locationSuggestions = [],
    eventNameSuggestions = [],
}) {
    const isNew = !event?.id;

    useEffect(() => {
        const handleKeyDown = e => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const toArray = val => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string")
            return val
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);
        return Object.values(val);
    };

    const [customInput, setCustomInput] = useState("");
    const customInputRef = useRef(null);
    const [locationOpen, setLocationOpen] = useState(false);
    const locationRef = useRef(null);
    const [eventNameOpen, setEventNameOpen] = useState(false);
    const [locationTbd, setLocationTbd] = useState(
        event?.location === "장소 미정",
    );

    const [form, setForm] = useState(() => ({
        ...EMPTY_EVENT,
        ...event,
        genre: toArray(event?.genre),
        schedule:
            isoToLocal(event?.schedule) ||
            new Date().toISOString().slice(0, 10),
        time_start: isoToTime(event?.time_start),
        time_entrance: isoToTime(event?.time_entrance),
        time_end: isoToTime(event?.time_end),
    }));

    const set = (field, value) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const toggleGenre = genre =>
        setForm(prev => ({
            ...prev,
            genre: prev.genre?.includes(genre)
                ? prev.genre.filter(g => g !== genre)
                : [...(prev.genre || []), genre],
        }));

    const addCustomGenres = raw => {
        const tags = raw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        if (!tags.length) return;
        setForm(prev => {
            const next = [...(prev.genre || [])];
            tags.forEach(tag => {
                if (!next.includes(tag)) next.push(tag);
            });
            return { ...prev, genre: next };
        });
        setCustomInput("");
    };

    const removeGenre = genre =>
        setForm(prev => ({
            ...prev,
            genre: prev.genre.filter(g => g !== genre),
        }));

    const toISO = localVal => {
        if (!localVal) return "";
        try {
            return new Date(localVal).toISOString();
        } catch {
            return localVal;
        }
    };

    // "HH:MM" + schedule 날짜 → ISO string
    const timeToISO = timeVal => {
        if (!timeVal) return null;
        const datePart = form.schedule
            ? form.schedule.slice(0, 10)
            : new Date().toISOString().slice(0, 10);
        try {
            return new Date(`${datePart}T${timeVal}`).toISOString();
        } catch {
            return null;
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        const data = {
            ...form,
            genre: Array.isArray(form.genre)
                ? form.genre.join(", ")
                : form.genre || "",
            schedule: toISO(form.schedule),
            time_start: timeToISO(form.time_start),
            time_entrance: timeToISO(form.time_entrance),
            time_end: timeToISO(form.time_end),
        };
        // Clean up nullish optional fields
        if (!data.time_start) delete data.time_start;
        if (!data.time_entrance) delete data.time_entrance;
        if (!data.time_end) delete data.time_end;
        if (!data.etc) delete data.etc;
        if (!data.img_url) delete data.img_url;
        if (!data.event_url) delete data.event_url;
        onSave(data);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:items-center bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl my-4 sm:my-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl flex flex-col max-h-[calc(100dvh-5rem)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/70 dark:border-gray-800">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {isNew ? "이벤트 추가" : "이벤트 수정"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
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
                </div>

                {/* Form body */}
                <form
                    id="event-edit-form"
                    onSubmit={handleSubmit}
                    className="px-6 py-5 space-y-5 overflow-y-auto flex-1"
                >
                    {/* 이벤트명 */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                            이벤트명 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={form.event_name}
                                onChange={e => {
                                    set("event_name", e.target.value);
                                    setEventNameOpen(e.target.value.length > 0);
                                }}
                                onBlur={() =>
                                    setTimeout(
                                        () => setEventNameOpen(false),
                                        150,
                                    )
                                }
                                placeholder="이벤트 이름을 입력하세요"
                                className={inputClass}
                                autoComplete="off"
                            />
                            {eventNameOpen &&
                                (() => {
                                    const q =
                                        form.event_name?.toLowerCase() ?? "";
                                    const filtered =
                                        eventNameSuggestions.filter(
                                            n =>
                                                n.toLowerCase().includes(q) &&
                                                n !== form.event_name,
                                        );
                                    return filtered.length > 0 ? (
                                        <ul className="absolute z-10 text-left mt-1 w-full max-h-48 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg text-sm">
                                            {filtered.map(name => (
                                                <li
                                                    key={name}
                                                    onMouseDown={() => {
                                                        set("event_name", name);
                                                        setEventNameOpen(false);
                                                    }}
                                                    className="px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 text-gray-900 dark:text-white transition-colors"
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null;
                                })()}
                        </div>
                    </div>

                    {/* 날짜 + 장소 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                                날짜 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.schedule}
                                onChange={e => set("schedule", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5" ref={locationRef}>
                            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                                장소
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={
                                        locationTbd
                                            ? "장소 미정"
                                            : form.location
                                    }
                                    disabled={locationTbd}
                                    onChange={e => {
                                        set("location", e.target.value);
                                        setLocationOpen(
                                            e.target.value.length > 0,
                                        );
                                    }}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setLocationOpen(false),
                                            150,
                                        )
                                    }
                                    placeholder="장소를 입력하세요"
                                    className={`${inputClass} ${locationTbd ? "opacity-50 cursor-not-allowed" : ""}`}
                                    autoComplete="off"
                                />
                                {locationOpen &&
                                    (() => {
                                        const q =
                                            form.location?.toLowerCase() ?? "";
                                        const filtered =
                                            locationSuggestions.filter(
                                                l =>
                                                    l
                                                        .toLowerCase()
                                                        .includes(q) &&
                                                    l !== form.location,
                                            );
                                        return filtered.length > 0 ? (
                                            <ul className="absolute z-10 mt-1 w-full text-left max-h-48 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg text-sm">
                                                {filtered.map(loc => (
                                                    <li
                                                        key={loc}
                                                        onMouseDown={() => {
                                                            set(
                                                                "location",
                                                                loc,
                                                            );
                                                            setLocationOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className="px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 text-gray-900 dark:text-white transition-colors"
                                                    >
                                                        {loc}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null;
                                    })()}
                            </div>
                            <label className="inline-flex items-center w-full pl-2 gap-2 mt-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={locationTbd}
                                    onChange={e => {
                                        setLocationTbd(e.target.checked);
                                        if (e.target.checked)
                                            set("location", "장소 미정");
                                        else set("location", "");
                                    }}
                                    className="w-3.5 h-3.5 rounded accent-indigo-600"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    장소 미정
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* 시간 */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            시간 정보{" "}
                            <span className="text-xs text-gray-400">
                                (선택)
                            </span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left sm:text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 p-3 sm:pt-1">
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 pl-2 sm:pl-0">
                                    시작
                                </span>
                                <input
                                    type="time"
                                    value={form.time_start}
                                    onChange={e =>
                                        set("time_start", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 pl-2 sm:pl-0">
                                    입장
                                </span>
                                <input
                                    type="time"
                                    value={form.time_entrance}
                                    onChange={e =>
                                        set("time_entrance", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 pl-2 sm:pl-0">
                                    종료
                                </span>
                                <input
                                    type="time"
                                    value={form.time_end}
                                    onChange={e =>
                                        set("time_end", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 장르 */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                            장르 <span className="text-red-500">*</span>
                        </label>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 p-3 space-y-3">
                            {/* 사전설정 장르 토글 */}
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${
                                            form.genre?.includes(genre)
                                                ? GENRE_COLORS[genre] ||
                                                  GENRE_COLORS.default
                                                : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                                        }`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>

                            {/* 커스텀 장르 태그 */}
                            {form.genre?.filter(g => !GENRES.includes(g))
                                .length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1  dark:border-gray-700/70">
                                    {form.genre
                                        .filter(g => !GENRES.includes(g))
                                        .map(g => (
                                            <span
                                                key={g}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            >
                                                {g}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeGenre(g)
                                                    }
                                                    className="text-gray-400 bg-gray-200 dark:bg-gray-800 rounded-full px-0.5 py-0.5 hover:text-gray-700 dark:hover:text-gray-100 leading-none"
                                                >
                                                    <svg
                                                        className="w-3 h-3"
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
                                            </span>
                                        ))}
                                </div>
                            )}

                            {/* 커스텀 장르 입력 */}
                            <div className="flex gap-2 pt-1 ">
                                <input
                                    ref={customInputRef}
                                    type="text"
                                    value={customInput}
                                    onChange={e =>
                                        setCustomInput(e.target.value)
                                    }
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addCustomGenres(customInput);
                                        }
                                    }}
                                    placeholder="기타 장르 입력 (쉼표로 복수 입력)"
                                    className={`${inputClass} flex-1 text-xs`}
                                />
                                <button
                                    type="button"
                                    onClick={() => addCustomGenres(customInput)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* URL 정보 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                                이벤트 SNS 링크{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.event_url}
                                onChange={e => set("event_url", e.target.value)}
                                placeholder="https://..."
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                                이미지 URL
                            </label>
                            <input
                                type="text"
                                value={form.img_url}
                                onChange={e => set("img_url", e.target.value)}
                                placeholder="https://..."
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* 기타 정보 */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                            기타 정보
                        </label>
                        <textarea
                            value={form.etc}
                            onChange={e => set("etc", e.target.value)}
                            placeholder="추가 정보를 입력하세요"
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* 표출 여부 토글 */}
                    <div
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 cursor-pointer select-none"
                        onClick={() => set("confirm", !form.confirm)}
                    >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            표출 여부
                        </p>
                        <div
                            role="switch"
                            aria-checked={form.confirm}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                form.confirm
                                    ? "bg-indigo-600"
                                    : "bg-gray-300 dark:bg-gray-600"
                            }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                    form.confirm
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                }`}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-4 border-t border-gray-200/70 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        form="event-edit-form"
                        disabled={
                            isSaving ||
                            !form.event_name.trim() ||
                            !form.schedule ||
                            (form.genre?.length ?? 0) === 0 ||
                            !form.event_url.trim()
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving && (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isNew ? "추가하기" : "저장하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
