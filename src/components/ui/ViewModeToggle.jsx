export const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex mb-4 space-x-2">
      <button
        onClick={() => onViewModeChange("calendar")}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          viewMode === "calendar"
            ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700"
        }`}
      >
        캘린더
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          viewMode === "table"
            ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 lg:hover:bg-gray-300 dark:lg:hover:bg-gray-700"
        }`}
      >
        테이블
      </button>
    </div>
  );
};
