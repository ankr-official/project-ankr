import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

/**
 * Dark / light mode toggle switch. Controlled — pass isDark and onToggle.
 *
 * @param {{ isDark: boolean, onToggle: () => void, className?: string }} props
 */
export function ThemeToggle({ isDark, onToggle, className = '' }) {
  return (
    <button
      onClick={onToggle}
      className={[
        'inline-flex items-center gap-2 rounded-full px-3 py-2 bg-transparent',
        'active:bg-black/5 mouse:hover:bg-black/5',
        'dark:active:bg-white/5 dark:mouse:hover:bg-white/5',
        'transition-colors focus:outline-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      type="button"
    >
      {isDark ? (
        <MoonIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
      )}
      <span
        className={[
          'relative inline-flex h-6 w-9 lg:h-8 lg:w-12 items-center rounded-full transition-colors',
          isDark ? 'bg-gray-600' : 'bg-gray-300',
        ].join(' ')}
      >
        <span
          className={[
            'inline-flex h-4 w-4 lg:h-6 lg:w-6 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200 ease-out',
            isDark ? 'translate-x-4 lg:translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </span>
    </button>
  );
}
