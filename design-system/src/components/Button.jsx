/**
 * @typedef {'primary'|'secondary'|'ghost'|'danger'} ButtonVariant
 * @typedef {'sm'|'md'|'lg'} ButtonSize
 */

const variantClasses = {
  primary:
    'bg-indigo-600 text-white active:bg-indigo-700 mouse:hover:bg-indigo-700 focus:ring-indigo-500',
  secondary:
    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 focus:ring-gray-400',
  ghost:
    'bg-transparent text-gray-600 dark:text-gray-300 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 focus:ring-gray-400',
  danger:
    'bg-red-600 text-white active:bg-red-700 mouse:hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * 여러 시각적 스타일을 지원하는 기본 액션 버튼.
 *
 * @param {{ variant?: ButtonVariant, size?: ButtonSize, disabled?: boolean, loading?: boolean, fullWidth?: boolean, children: import('react').ReactNode, onClick?: () => void, type?: 'button'|'submit'|'reset', className?: string }} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
