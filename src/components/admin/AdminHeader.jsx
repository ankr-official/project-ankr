import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

export default function AdminHeader({ user, signOut, navigate }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:opacity-70 transition-opacity shrink-0"
          >
            <svg
              className="w-5 h-5 sm:hidden"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <img src="/favicon.svg" alt="ANKR" className="w-6 h-6 hidden sm:block" />
            <span className="hidden sm:block text-base">ANKR.KR</span>
          </Link>
          <svg
            className="w-4 h-4 text-gray-300 dark:text-gray-600 hidden sm:block shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            관리자 페이지
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
            {user?.email}
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs sm:text-sm bg-white/70 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
