/**
 * @typedef {'indigo'|'blue'|'green'|'red'|'yellow'|'pink'|'purple'|'cyan'|'orange'|'lime'|'gray'} BadgeColor
 * @typedef {'sm'|'md'} BadgeSize
 */

const colorClasses = {
  indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  blue: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-white',
  green: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-white',
  red: 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-white',
  yellow: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-white',
  pink: 'bg-pink-200 dark:bg-pink-900 text-pink-900 dark:text-white',
  purple: 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-white',
  cyan: 'bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-white',
  orange: 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-white',
  lime: 'bg-lime-200 dark:bg-lime-900 text-lime-900 dark:text-white',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
};

/**
 * Colored badge / tag pill for labels, statuses, or categories.
 *
 * @param {{ label: string, color?: BadgeColor, size?: BadgeSize, className?: string }} props
 */
export function Badge({ label, color = 'indigo', size = 'md', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full',
        colorClasses[color] || colorClasses.gray,
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  );
}
