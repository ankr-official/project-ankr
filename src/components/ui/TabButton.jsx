export const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full lg:w-fit lg:mb-0 px-4 py-2 text-sm font-medium lg:rounded-t-lg lg:rounded-b-none transition-colors duration-200 ${
            isActive
                ? "text-white bg-indigo-600"
                : "bg-indigo-900 lg:hover:text-gray-300 lg:hover:bg-indigo-700"
        }`}
    >
        {children}
    </button>
);