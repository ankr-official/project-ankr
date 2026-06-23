/**
 * @typedef {'none'|'sm'|'md'|'lg'} CardPadding
 */

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Surface container with dark mode and optional header.
 *
 * @param {{ children: import('react').ReactNode, title?: string, subtitle?: string, padding?: CardPadding, className?: string, onClick?: () => void }} props
 */
export function Card({
  children,
  title,
  subtitle,
  padding = 'md',
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors',
        onClick ? 'cursor-pointer active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-750 dark:mouse:hover:bg-gray-750' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || subtitle) && (
        <div className={`${paddingClasses[padding]} pb-0`}>
          {title && (
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
