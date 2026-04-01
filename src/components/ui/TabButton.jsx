export const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 rounded-none focus:outline-none ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400"
        : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
    }`}
  >
    {children}
  </button>
);
