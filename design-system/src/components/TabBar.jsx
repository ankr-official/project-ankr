/**
 * 세그먼트 컨트롤 탭 바 — 관리자 페이지에서 사용.
 * 활성 탭은 흰색/gray-700 pill에 그림자로 표시.
 *
 * @param {{ tabs: Array<{key: string, label: string, count?: number}>, active: string, onChange: (key: string) => void, className?: string }} props
 */
export function TabBar({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`h-10 w-full sm:w-fit flex items-center gap-1 p-1 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 overflow-x-auto [&::-webkit-scrollbar]:hidden ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === t.key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 active:text-gray-800 mouse:hover:text-gray-800 dark:active:text-gray-200 dark:mouse:hover:text-gray-200'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`ml-1.5 text-xs ${active === t.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
