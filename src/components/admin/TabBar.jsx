export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="h-10 w-full sm:w-fit flex items-center gap-1 p-1 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === t.key
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={`ml-1.5 text-xs ${
                active === t.key
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
