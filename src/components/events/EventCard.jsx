import { formatDate } from "../../utils/dateUtils";
import { GenreTag } from "../common/GenreTag";
import { LocationLink } from "../common/LocationLink";
import { HeartButton } from "../common/HeartButton";

const pad = (n) => String(n).padStart(2, "0");

const formatTimeRange = (time_start, time_end) => {
  const ds = new Date(time_start);
  const hs = ds.getHours();
  const icon = hs >= 6 && hs < 17 ? "☀️" : "🌙";
  const start = `${pad(hs)}:${pad(ds.getMinutes())}`;
  if (!time_end) return `${icon} ${start} ~ 정보 없음`;
  const de = new Date(time_end);
  return `${icon} ${start} ~ ${pad(de.getHours())}:${pad(de.getMinutes())}`;
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
          <img
            src={event.img_url.replace(/(name=)[^&]*/, "$1small")}
            alt={event.event_name}
            className="object-cover flex-shrink-0 w-24 h-32 rounded-lg"
          />
        ) : (
          <img
            src="./dummy.svg"
            alt="Dummy"
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
          {event.time_start && (
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
              {formatTimeRange(event.time_start, event.time_end)}
            </p>
          )}
          {!event.time_start && showDate && <div className="mb-2" />}
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
