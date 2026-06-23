import { ImageWithSkeleton } from './ImageWithSkeleton';
import { GenreBadge } from './GenreBadge';

/**
 * Card displaying a single ANKR event — image, title, schedule date, location, and genre tags.
 *
 * @param {{ eventName: string, schedule: string, location: string, genre?: string, imgUrl?: string, isPast?: boolean, viewCount?: number, onClick?: () => void, className?: string }} props
 */
export function EventCard({
  eventName,
  schedule,
  location,
  genre,
  imgUrl,
  isPast = false,
  viewCount,
  onClick,
  className = '',
}) {
  const dateLabel = schedule
    ? new Date(schedule).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div
      onClick={onClick}
      className={[
        'group relative rounded-xl overflow-hidden bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700 transition-colors',
        onClick
          ? 'cursor-pointer active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-750 dark:mouse:hover:bg-gray-750'
          : '',
        isPast ? 'opacity-70' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {imgUrl && (
        <ImageWithSkeleton
          src={imgUrl}
          alt={eventName}
          wrapperClassName="w-full aspect-video"
          imgClassName="w-full h-full object-cover"
        />
      )}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
          {eventName}
        </h3>
        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
          {dateLabel && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" />
              </svg>
              {dateLabel}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="1.5" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1.5" />
              </svg>
              {location}
            </span>
          )}
        </div>
        {genre && <GenreBadge genre={genre} />}
        {isPast && (
          <span className="self-start text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            종료됨
          </span>
        )}
        {viewCount !== undefined && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            조회 {viewCount.toLocaleString()}회
          </span>
        )}
      </div>
    </div>
  );
}
