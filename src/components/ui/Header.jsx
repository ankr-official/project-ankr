import ThemeToggle from "./ThemeToggle";

export const Header = ({ onSearchOpen }) => {
  return (
    <div className="flex lg:flex-row flex-col gap-3 lg:gap-4 justify-between items-center lg:px-6   mb-6 transition-colors">
      {/* 타이틀 영역: 모바일/데스크톱 공통 사용, 다크모드 토글은 모바일에서만 표시 */}
      <div className="flex-1 w-full px-4 lg:px-0 flex items-center justify-between">
        <a
          href="/"
          className="flex-1 inline-flex items-center gap-2 text-balance text-xl font-bold md:text-3xl text-gray-900 dark:text-white transition-colors text-left lg:hover:opacity-50 transition-opacity p-2"
        >
          <img
            src="/favicon.svg"
            alt="ANKR 로고"
            className="w-7 h-7 md:w-8 md:h-8"
          />
          <span>ANKR.KR</span>
        </a>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>

      {/* 검색 버튼을 긴 검색바 형태로 표시 */}
      <button
        onClick={onSearchOpen}
        className="group flex flex-1 items-center justify-between w-full lg:w-80 px-4 py-2.5 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 text-sm text-gray-500 dark:text-gray-400 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-indigo-500/70 transition-colors"
        id="search-button"
        title="검색 열기"
      >
        <span className="truncate text-left">
          이벤트명, 장소, 장르로 검색...
        </span>
        <span className="flex items-center justify-center w-8 h-8 rounded-full  text-gray-700 dark:text-gray-200 transition-colors">
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
        </span>
      </button>
      <div className="flex-1 text-right hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  );
};
