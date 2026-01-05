export const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full lg:w-fit lg:mb-0 px-4 py-2 text-sm font-medium lg:rounded-t-lg lg:rounded-b-none transition-colors duration-200 ${
            isActive
                ? "text-white bg-indigo-600 dark:bg-indigo-600"
                : "text-gray-800 dark:text-gray-300 bg-indigo-200 dark:bg-indigo-900 lg:hover:text-gray-600 dark:lg:hover:text-gray-300 lg:hover:bg-indigo-300 dark:lg:hover:bg-indigo-700"
        }`}
    >
        {children}
    </button>
);