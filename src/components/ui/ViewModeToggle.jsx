export const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
      <button
        onClick={() => onViewModeChange("calendar")}
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-200 inline-flex items-center gap-2 rounded-none focus:outline-none ${
          viewMode === "calendar"
            ? "text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400"
            : "text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
            className="stroke-current"
          />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        캘린더
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-200 inline-flex items-center gap-2 rounded-none focus:outline-none ${
          viewMode === "table"
            ? "text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400"
            : "text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            ry="2"
            className="stroke-current"
          />
          <path
            d="M3 10h18M3 16h18M9 4v16M15 4v16"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        테이블
      </button>
    </div>
  );
};
