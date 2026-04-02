import { useState, useRef, useEffect } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginDropdown from "../LoginDropdown";
import UserMenuDropdown from "../UserMenuDropdown";
import SettingsModal from "../SettingsModal";

export const Header = ({ onSearchOpen }) => {
  const { isLoggedIn, role } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const loginRefMobile = useRef(null);
  const loginRefDesktop = useRef(null);

  useEffect(() => {
    if (!showLogin && !showUserMenu) return;
    const handleClick = (e) => {
      const inMobile = loginRefMobile.current?.contains(e.target);
      const inDesktop = loginRefDesktop.current?.contains(e.target);
      if (!inMobile && !inDesktop) {
        setShowLogin(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLogin, showUserMenu]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      setShowUserMenu((prev) => !prev);
      return;
    }
    setShowLogin((prev) => !prev);
  };

  const userButton = (
    <button
      type="button"
      onClick={handleAuthClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm bg-white/70 dark:bg-white/10 text-gray-900 dark:text-gray-100 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
    >
      {isLoggedIn ? (
        <>
          <UserIcon className="w-4 h-4 shrink-0" />
          <span>내 메뉴</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span>로그인</span>
        </>
      )}
    </button>
  );

  return (
    <>
      <div className="flex flex-col gap-3 justify-between items-center mb-6 transition-colors lg:flex-row lg:gap-4 lg:px-2">
        <div className="flex flex-1 justify-between items-center w-full">
          <a
            href="/"
            className="inline-flex flex-1 gap-2 items-center p-2 text-xl font-bold text-left text-gray-900 transition-opacity text-balance md:text-3xl dark:text-white lg:hover:opacity-50"
          >
            <img
              src="/favicon.svg"
              alt="ANKR 로고"
              className="w-7 h-7 md:w-8 md:h-8"
            />
            <span>ANKR.KR</span>
          </a>
          <div className="flex gap-2 items-center lg:hidden">
            <ThemeToggle />
            <div className="relative" ref={loginRefMobile}>
              {userButton}
              {showLogin && (
                <LoginDropdown onClose={() => setShowLogin(false)} />
              )}
              {showUserMenu && (
                <UserMenuDropdown
                  onClose={() => setShowUserMenu(false)}
                  onSettings={() => setShowSettings(true)}
                />
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onSearchOpen}
          className="group flex flex-1 items-center justify-between w-full lg:w-80 px-4 py-2.5 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 text-sm text-gray-500 dark:text-gray-400 border border-gray-300/70 dark:border-gray-700/70 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-indigo-500/70 transition-colors"
          id="search-button"
          title="검색 열기"
        >
          <span className="text-left truncate">
            이벤트명, 장소, 장르로 검색...
          </span>
          <span className="flex justify-center items-center w-8 h-8 text-gray-700 rounded-full transition-colors dark:text-gray-200">
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

        <div className="hidden flex-1 gap-2 justify-end items-center text-right lg:flex">
          <ThemeToggle />
          <div className="relative" ref={loginRefDesktop}>
            {userButton}
            {showLogin && <LoginDropdown onClose={() => setShowLogin(false)} />}
            {showUserMenu && (
              <UserMenuDropdown
                onClose={() => setShowUserMenu(false)}
                onSettings={() => setShowSettings(true)}
              />
            )}
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};
