import { useState } from "react";
import { GENRE_COLORS } from "../../constants";
import { GENRES, inputClass } from "../../utils/eventFormUtils";

const ANY_SONG = "Any Song (복합)";

export function GenreSelector({ genres = [], onToggle, onAdd, onRemove }) {
    const [customInput, setCustomInput] = useState("");

    const handleAdd = () => {
        if (!customInput.trim()) return;
        onAdd(customInput);
        setCustomInput("");
    };

    const anySongSelected = genres.includes(ANY_SONG);

    return (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 p-3 space-y-3">
            <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => {
                    const isSelected = genres.includes(genre);
                    const isDisabled = anySongSelected && genre !== ANY_SONG;
                    return (
                        <button
                            key={genre}
                            type="button"
                            onClick={() => !isDisabled && onToggle(genre)}
                            disabled={isDisabled}
                            className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${
                                isDisabled
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
                                    : isSelected
                                    ? GENRE_COLORS[genre] || GENRE_COLORS.default
                                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                            }`}
                        >
                            {genre}
                        </button>
                    );
                })}
            </div>

            {genres.filter(g => !GENRES.includes(g)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {genres.filter(g => !GENRES.includes(g)).map(g => (
                        <span
                            key={g}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            {g}
                            <button
                                type="button"
                                onClick={() => onRemove(g)}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 leading-none"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    placeholder="기타 장르 입력 (쉼표로 복수 입력)"
                    className={`${inputClass} flex-1 text-xs`}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0"
                >
                    추가
                </button>
            </div>
        </div>
    );
}
