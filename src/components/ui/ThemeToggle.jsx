import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useThemeContext } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 bg-transparent lg:hover:bg-black/5 lg:dark:hover:bg-white/5 transition-colors focus:outline-none"
      aria-label="Toggle theme"
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      type="button"
    >
      {/* 왼쪽 아이콘 (밝기/해 아이콘) */}
      {isDark ? <MoonIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" /> : <SunIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />}

      {/* 스위치 */}
      <span
        className={`relative inline-flex h-6 lg:h-8 w-9 lg:w-12 items-center rounded-full transition-colors ${
          isDark ? "bg-gray-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-flex h-4 w-4 lg:h-6 lg:w-6 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-out ${
            isDark ? "translate-x-4 lg:translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
