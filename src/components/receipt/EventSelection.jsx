import { useMemo, useState } from "react";
import { GENRE_COLORS } from "../../constants";

export function EventSelection({ events, selectedIds, onToggle, onClear }) {
    if (!events?.length) {
        return (
            <div className="p-4 text-sm text-gray-400 border border-gray-600 border-dashed">
                참여한 이벤트 데이터가 아직 없습니다. 잠시 후 다시 시도해
                주세요.
            </div>
        );
    }

    const [keyword, setKeyword] = useState("");
    const [quarter, setQuarter] = useState("all"); // all | Q1 | Q2 | Q3 | Q4
    const [selectedGenre, setSelectedGenre] = useState("all"); // all | 장르명

    const filteredEvents = useMemo(() => {
        const q = keyword.trim().toLowerCase();

        const byQuarter = events.filter(event => {
            if (quarter === "all") return true;
            const date = event.scheduleDate || new Date(event.schedule);
            const month = date.getMonth(); // 0~11

            const quarterIndex =
                month <= 2
                    ? "Q1"
                    : month <= 5
                      ? "Q2"
                      : month <= 8
                        ? "Q3"
                        : "Q4";

            return quarterIndex === quarter;
        });

        const byGenre = byQuarter.filter(event => {
            if (selectedGenre === "all") return true;

            const raw = event.genre || "";
            const genres = raw
                .split(",")
                .map(g => g.trim())
                .filter(Boolean);

            return genres.includes(selectedGenre);
        });

        if (!q) return byGenre;

        return byGenre.filter(event =>
            (event.event_name || "").toLowerCase().includes(q)
        );
    }, [events, keyword, quarter, selectedGenre]);

    return (
        <div className="flex flex-col h-full">
            {/* Genre Filter */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-[13px] bg-gray-900/50 py-2 px-2 rounded-lg">
                {[
                    "all",
                    ...Object.keys(GENRE_COLORS).filter(
                        genre => genre !== "default"
                    ),
                ].map(genre => (
                    <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-2.5 py-1.5 rounded-full font-medium transition-colors ${
                            selectedGenre === genre
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-300 lg:hover:bg-gray-700 focus:bg-gray-700"
                        }`}
                    >
                        {genre === "all" ? "전체 장르" : genre}
                    </button>
                ))}
            </div>
            {/* Search & Clear */}
            <div className="flex gap-2 items-center mb-4">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="행사명 검색"
                    className="flex-1 px-2 py-1 rounded border border-gray-700 bg-black/40 focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-gray-500"
                />
                <button
                    type="button"
                    onClick={() => {
                        setKeyword("");
                        setQuarter("all");
                        setSelectedGenre("all");
                        onClear?.();
                    }}
                    className="px-2 py-1 font-mono text-gray-200 whitespace-nowrap bg-gray-900 rounded border border-red-600 lg:hover:bg-black/70 focus:bg-black/70 lg:hover:text-red-400 focus:text-red-400"
                >
                    리셋
                </button>
            </div>
            {/* Quarter Filter */}
            <div className="flex flex-wrap gap-2 mb-4 mx-1 text-[14px]">
                {[
                    { key: "all", label: "전체 기간" },
                    { key: "Q1", label: "1분기" },
                    { key: "Q2", label: "2분기" },
                    { key: "Q3", label: "3분기" },
                    { key: "Q4", label: "4분기" },
                ].map(({ key, label }) => {
                    const isActive = quarter === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setQuarter(key)}
                            className={`px-3 py-1 rounded-lg border ${
                                isActive
                                    ? "text-indigo-100 border-indigo-400 bg-indigo-500/20"
                                    : "text-gray-300 border-gray-700 bg-black/50 lg:hover:bg-black/60 focus:bg-black/60"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3 max-h-[600px] lg:max-h-none">
                {filteredEvents.map(event => {
                    const isChecked = selectedIds.includes(event.id);
                    const posterSrc = event.img_url
                        ? event.img_url.replace(/(name=)[^&]*/, "$1small")
                        : "./dummy.svg";

                    return (
                        <label
                            key={event.id}
                            className="flex gap-4 items-center px-3 py-3 rounded-lg border border-gray-800 cursor-pointer bg-black/40 lg:hover:bg-black/70 focus:bg-black/70"
                        >
                            <input
                                type="checkbox"
                                className="mt-1 accent-gray-100"
                                checked={isChecked}
                                onChange={() => onToggle(event.id)}
                            />
                            <div className="flex gap-4 items-center">
                                <img
                                    src={posterSrc}
                                    alt={event.event_name}
                                    className="object-cover flex-shrink-0 w-10 h-10 rounded-full"
                                />
                                <div className="flex flex-col text-left text-gray-100">
                                    <span className="font-mono text-[11px] text-gray-400">
                                        {event.scheduleDate?.toLocaleDateString(
                                            "ko-KR",
                                            {
                                                year: "2-digit",
                                                month: "2-digit",
                                                day: "2-digit",
                                            }
                                        ) || event.schedule}
                                    </span>
                                    <span className="font-semibold">
                                        {event.event_name}
                                    </span>
                                </div>
                            </div>
                        </label>
                    );
                })}
                {filteredEvents.length === 0 && (
                    <div className="py-6 text-xs text-center text-gray-400">
                        검색어에 해당하는 행사가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
