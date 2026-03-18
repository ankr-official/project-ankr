import { useState, useRef } from "react";
import { GENRE_COLORS, GENRE_HOVER_COLORS } from "../../constants";
import { GENRES, inputClass } from "../../utils/eventFormUtils";

const ANY_SONG = "Any Song (복합)";

export function GenreSelector({ genres = [], onToggle, onAdd, onRemove }) {
  const [customInput, setCustomInput] = useState("");
  const isComposing = useRef(false);

  const handleAdd = () => {
    if (!customInput.trim()) return;
    onAdd(customInput);
    setCustomInput("");
  };

  const anySongSelected = genres.includes(ANY_SONG);

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 p-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const isSelected = genres.includes(genre);
          const isDisabled = anySongSelected && genre !== ANY_SONG;
          return (
            <button
              key={genre}
              type="button"
              onClick={() => {
                if (isDisabled) return;
                if (genre === ANY_SONG && !genres.includes(ANY_SONG)) {
                  GENRES.filter(
                    (g) => g !== ANY_SONG && genres.includes(g),
                  ).forEach((g) => onRemove(g));
                }
                onToggle(genre);
              }}
              disabled={isDisabled}
              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${
                isDisabled
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
                  : isSelected
                    ? GENRE_COLORS[genre] || GENRE_COLORS.default
                    : `bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 ${GENRE_HOVER_COLORS[genre] || GENRE_HOVER_COLORS.default}`
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {genres.filter((g) => !GENRES.includes(g)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {genres
            .filter((g) => !GENRES.includes(g))
            .map((g) => (
              <span
                key={g}
                onClick={() => onRemove(g)}
                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {g}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(g);
                  }}
                  className="text-gray-400 px-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={() => {
            isComposing.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing.current) {
              e.preventDefault();
              handleAdd();
            }
          }}
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
