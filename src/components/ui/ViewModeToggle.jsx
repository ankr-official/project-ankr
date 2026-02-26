export const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex mb-4 space-x-2">
      <button
        onClick={() => onViewModeChange("calendar")}
        className={`px-4 py-2 w-full lg:w-fit text-sm font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
          viewMode === "calendar"
            ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700"
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
        className={`px-4 py-2 text-sm w-full lg:w-fit font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
          viewMode === "table"
            ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700"
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
