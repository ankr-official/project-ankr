import { formatDate, toKSTDate } from "../../utils/dateUtils";
import { GenreTag } from "../common/GenreTag";
import { LocationLink } from "../common/LocationLink";
import { HeartButton } from "../common/HeartButton";
import { ImageWithSkeleton } from "../common/ImageWithSkeleton";

const pad = (n) => String(n).padStart(2, "0");

const formatTimeRange = (time_start, time_entrance, time_end) => {
  const startISO = time_entrance || time_start;
  if (!startISO) return null;
  const kstStart = toKSTDate(startISO);
  const hs = kstStart.getUTCHours();
  const icon = hs >= 6 && hs < 17 ? "☀️" : "🌙";
  const start = `${pad(hs)}:${pad(kstStart.getUTCMinutes())}`;
  if (!time_end) return `${icon} ${start} ~ 정보 없음`;
  const kstEnd = toKSTDate(time_end);
  return `${icon} ${start} ~ ${pad(kstEnd.getUTCHours())}:${pad(kstEnd.getUTCMinutes())}`;
};

export const EventCard = ({
  event,
  onEventSelect,
  showDate = true,
  showHeart = true,
  className = "p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow cursor-pointer active:bg-indigo-200 dark:active:bg-indigo-900 transition-colors",
}) => {
  return (
    <div
      onClick={() => onEventSelect(event)}
      className={`relative ${className}`}
    >
      {showHeart && <HeartButton eventId={event.id} eventDate={event.schedule} className="absolute top-2 right-2 z-10" />}
      <div className="flex items-center space-x-4 h-full">
        {event.img_url ? (
          <ImageWithSkeleton
            src={event.img_url.replace(/(name=)[^&]*/, "$1small")}
            alt={event.event_name}
            wrapperClassName="flex-shrink-0 w-24 h-32 rounded-lg"
            imgClassName="object-cover w-full h-full"
          />
        ) : (
          <img
            src="./dummy.svg"
            alt="Dummy"
            loading="lazy"
            className="object-cover flex-shrink-0 w-24 h-32 rounded-lg"
          />
        )}
        <div className="flex-1 min-w-0 text-left pr-8">
          {showDate && (
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-300 transition-colors">
              {formatDate(event.schedule)}
            </p>
          )}
          <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white truncate transition-colors">
            {event.event_name}
          </h3>
          {(event.time_entrance || event.time_start) && (
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
              {formatTimeRange(event.time_start, event.time_entrance, event.time_end)}
            </p>
          )}
          {!event.time_entrance && !event.time_start && showDate && <div className="mb-2" />}
          <div className="mb-2">
            <GenreTag genre={event.genre} />
          </div>
          <div className="">
            <LocationLink
              location={event.location}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
