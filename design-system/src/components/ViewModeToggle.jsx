/**
 * @typedef {'calendar'|'list'} ViewMode
 */

/**
 * Switcher between calendar and list view modes.
 *
 * @param {{ viewMode: ViewMode, onViewModeChange: (mode: ViewMode) => void, className?: string }} props
 */
export function ViewModeToggle({ viewMode, onViewModeChange, className = '' }) {
  const tabBase =
    'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-200 inline-flex items-center gap-2 rounded-none focus:outline-none';
  const activeTab =
    'text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400';
  const inactiveTab =
    'text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300';

  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <button
        onClick={() => onViewModeChange('calendar')}
        className={`${tabBase} ${viewMode === 'calendar' ? activeTab : inactiveTab}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" />
        </svg>
        캘린더
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`${tabBase} ${viewMode === 'list' ? activeTab : inactiveTab}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        목록
      </button>
    </div>
  );
}
