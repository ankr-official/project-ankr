/**
 * @typedef {'원곡'|'우치이베'|'랜플댄'|'리믹스'|'전자음악'|'동인음악'|'리듬게임'|'보컬로이드'|'코스프레'|'Any Song (복합)'} Genre
 */

const GENRE_COLORS = {
  원곡: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-white',
  우치이베: 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-white',
  랜플댄: 'bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-white',
  리믹스: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-white',
  전자음악: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-white',
  동인음악: 'bg-pink-200 dark:bg-pink-900 text-pink-900 dark:text-white',
  리듬게임: 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-white',
  보컬로이드: 'bg-violet-200 dark:bg-violet-900 text-violet-900 dark:text-white',
  코스프레: 'bg-lime-200 dark:bg-lime-900 text-lime-900 dark:text-white',
  'Any Song (복합)': 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-white',
  default: 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white',
};

/**
 * Genre badge for ANKR event genres. Supports multiple comma-separated genres.
 *
 * @param {{ genre: string, className?: string }} props
 */
export function GenreBadge({ genre, className = '' }) {
  const genres = genre.split(',').map((g) => g.trim());

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {genres.map((g) => (
        <span
          key={g}
          className={`px-2 py-1 text-xs font-medium rounded-full ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
        >
          {g}
        </span>
      ))}
    </div>
  );
}
