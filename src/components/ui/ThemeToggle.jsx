import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useThemeContext } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeContext();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
            title={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
        >
            {theme === "light" ? (
                <MoonIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            ) : (
                <SunIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
        </button>
    );
};

export default ThemeToggle;
