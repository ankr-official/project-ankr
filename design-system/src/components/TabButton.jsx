/**
 * TabBar 내부 또는 단독 탭 내비게이션에 사용하는 개별 탭 버튼.
 *
 * @param {{ isActive?: boolean, onClick?: () => void, children: import('react').ReactNode, className?: string }} props
 */
export function TabButton({ isActive = false, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 rounded-none focus:outline-none whitespace-nowrap',
        isActive
          ? 'text-indigo-600 dark:text-indigo-400 border-b-indigo-600 dark:border-b-indigo-400'
          : 'text-gray-500 dark:text-gray-400 border-transparent active:text-gray-700 mouse:hover:text-gray-700 dark:active:text-gray-300 dark:mouse:hover:text-gray-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
