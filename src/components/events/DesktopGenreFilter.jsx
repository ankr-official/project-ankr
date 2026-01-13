import { useState, useEffect, useRef } from "react";
import { GENRE_COLORS } from "../../constants";

export const DesktopGenreFilter = ({ selectedGenres, onGenreChange }) => {
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
    <div className="relative h-full" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex gap-2 justify-start items-center px-2 py-1 text-sm text-black dark:text-white bg-gray-300 dark:bg-gray-800 rounded-lg border border-gray-700 dark:border-gray-700 lg:hover:bg-gray-400 dark:lg:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="absolute z-40 mt-1 w-48 bg-gray-300 dark:bg-gray-800 rounded-lg border border-gray-700 dark:border-gray-700 shadow-lg">
          <div className="p-2 space-y-1">
            {[
              "all",
              ...Object.keys(GENRE_COLORS).filter(
                (genre) => genre !== "default"
              ),
            ].map((genre) => (
              <label
                key={genre}
                className="flex items-center px-2 py-1 text-sm text-black dark:text-white rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => onGenreChange(genre)}
                  className="mr-2 text-indigo-600 dark:text-indigo-600 rounded border-gray-600 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-500"
                />
                {genre === "all" ? "전체" : genre}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
