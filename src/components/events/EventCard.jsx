import { formatDate } from "../../utils/dateUtils";
import { GenreTag } from "../common/GenreTag";
import { LocationLink } from "../common/LocationLink";

export const EventCard = ({ event, onEventSelect }) => {
    return (
        <div
            onClick={() => onEventSelect(event)}
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow cursor-pointer active:bg-indigo-200 dark:active:bg-indigo-900 transition-colors"
        >
            <div className="flex items-center space-x-4">
                {event.img_url ? (
                    <img
                        src={event.img_url.replace(
                            /(name=)[^&]*/,
                            "$1small"
                        )}
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
                <div className="flex-1 min-w-0 text-left">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                        {formatDate(event.schedule, event.time_start)}
                    </p>
                    <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white truncate transition-colors">
                        {event.event_name}
                    </h3>
                    <div className="mb-2">
                        <GenreTag genre={event.genre} />
                    </div>
                    <div className="">
                        <LocationLink
                            location={event.location}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};