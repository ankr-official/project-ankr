import ThemeToggle from "./ThemeToggle";

export const Header = ({ onSearchOpen }) => {
    return (
        <div className="flex flex-col justify-between items-center px-6 mb-6 border-b border-gray-300 dark:border-gray-700 transition-colors">
            <div className="flex gap-4 justify-center items-center mb-4 w-full">
                <h1 className="text-xl font-bold md:text-3xl text-gray-900 dark:text-white transition-colors">
                    한국 서브컬쳐 DJ 이벤트 DB
                </h1>
                <div className="flex gap-2">
                    <ThemeToggle />
                    <button
                        onClick={onSearchOpen}
                        className="p-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors active:bg-indigo-600 active:text-white lg:hover:bg-indigo-600 lg:hover:text-white"
                        title="검색"
                        id="search-button"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};