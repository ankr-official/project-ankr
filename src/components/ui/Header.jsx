import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginDropdown from "../LoginDropdown";

export const Header = ({ onSearchOpen }) => {
  const navigate = useNavigate();
  const { isLoggedIn, role, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef(null);

  useEffect(() => {
    if (!showLogin) return;
    const handleClick = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setShowLogin(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLogin]);

  const handleAuthClick = async () => {
    if (isLoggedIn) {
      await signOut();
      navigate("/");
      return;
    }
    setShowLogin((prev) => !prev);
  };

  return (
    <div className="flex lg:flex-row flex-col gap-3 lg:gap-4 justify-between items-center lg:px-2 mb-6 transition-colors">
      {/* 타이틀 영역: 모바일/데스크톱 공통 사용, 다크모드 토글은 모바일에서만 표시 */}
      <div className="flex-1 w-full flex items-center justify-between">
        <Link
          to="/"
          className="flex-1 inline-flex items-center gap-2 text-balance text-xl font-bold md:text-3xl text-gray-900 dark:text-white text-left lg:hover:opacity-50 transition-opacity p-2"
        >
          <img
            src="/favicon.svg"
            alt="ANKR 로고"
            className="w-7 h-7 md:w-8 md:h-8"
          />
          <span>ANKR.KR</span>
        </Link>
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn && role === "admin" && (
            <Link
              to="/admin"
              className="inline-flex items-center rounded-full px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              관리자
            </Link>
          )}
          <div className="relative" ref={loginRef}>
            <button
              type="button"
              onClick={handleAuthClick}
              className="inline-flex items-center rounded-full px-3 py-2 text-sm bg-white/70 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
            >
              {isLoggedIn ? "로그아웃" : "로그인"}
            </button>
            {showLogin && <LoginDropdown onClose={() => setShowLogin(false)} />}
          </div>
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
      <div className="flex-1 text-right hidden lg:flex items-center justify-end gap-2">
        <ThemeToggle />
        {isLoggedIn && role === "admin" && (
          <Link
            to="/admin"
            className="inline-flex items-center rounded-full px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            관리자
          </Link>
        )}
        <div className="relative" ref={loginRef}>
          <button
            type="button"
            onClick={handleAuthClick}
            className="inline-flex items-center rounded-full px-3 py-2 text-sm bg-white/70 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
          >
            {isLoggedIn ? "로그아웃" : "로그인"}
          </button>
          {showLogin && <LoginDropdown onClose={() => setShowLogin(false)} />}
        </div>
      </div>
    </div>
  );
};
