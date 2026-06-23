import { ImageWithSkeleton } from './ImageWithSkeleton';
import { GenreBadge } from './GenreBadge';

const toKSTDate = (d) => new Date(new Date(d).getTime() + 9 * 60 * 60 * 1000);
const pad = (n) => String(n).padStart(2, '0');

const formatDate = (schedule, timeStart, timeEnd) => {
  if (!schedule) return '';
  const kst = toKSTDate(schedule);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())} (${days[kst.getUTCDay()]})`;
  if (!timeStart) return date;
  const kstS = toKSTDate(timeStart);
  const hs = kstS.getUTCHours();
  const icon = hs >= 6 && hs < 17 ? '☀️' : '🌙';
  const start = `${pad(hs)}:${pad(kstS.getUTCMinutes())}`;
  if (!timeEnd) return `${date} ${icon} ${start}`;
  const kstE = toKSTDate(timeEnd);
  return `${date} ${icon} ${start} ~ ${pad(kstE.getUTCHours())}:${pad(kstE.getUTCMinutes())}`;
};

/**
 * Card displaying a single ANKR event — horizontal layout matching the app's EventCard.
 * Image on the left (w-24 h-32), text on the right.
 *
 * @param {{ eventName: string, schedule: string, location?: string, genre?: string, imgUrl?: string, timeStart?: string, timeEnd?: string, isPast?: boolean, onClick?: () => void, className?: string }} props
 */
export function EventCard({
  eventName,
  schedule,
  location,
  genre,
  imgUrl,
  timeStart,
  timeEnd,
  isPast = false,
  onClick,
  className = 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow cursor-pointer active:bg-indigo-200 dark:active:bg-indigo-900 transition-colors',
}) {
  return (
    <div
      onClick={onClick}
      className={`relative ${isPast ? 'opacity-70' : ''} ${className}`}
    >
      <div className="flex items-center space-x-4 h-full">
        {imgUrl ? (
          <ImageWithSkeleton
            src={imgUrl.replace(/(name=)[^&]*/, '$1small')}
            alt={eventName}
            wrapperClassName="flex-shrink-0 w-24 h-32 rounded-lg"
            imgClassName="object-cover w-full h-full"
          />
        ) : (
          <div className="flex-shrink-0 w-24 h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-300 transition-colors">
            {formatDate(schedule, timeStart, timeEnd)}
          </p>
          <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white truncate transition-colors">
            {eventName}
          </h3>
          <div className="mb-2">
            {genre && <GenreBadge genre={genre} />}
          </div>
          {location && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              📍 {location}
            </p>
          )}
          {isPast && (
            <span className="inline-block mt-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              종료됨
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
