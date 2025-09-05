import { formatDate } from "../../utils/dateUtils";
import { GenreTag } from "../common/GenreTag";
import { LocationLink } from "../common/LocationLink";
import { DesktopGenreFilter } from "./DesktopGenreFilter";
import { MobileGenreFilter } from "./MobileGenreFilter";
import { EventCard } from "./EventCard";

export const EventTable = ({
    events,
    className = "",
    onEventSelect,
    selectedGenres,
    onGenreChange,
}) => {
    return (
        <div className={`relative rounded-lg shadow-none lg:shadow ${className}`}>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto w-full lg:block">
                <table className="min-w-full table-auto min-h-fit">
                    <thead className="bg-gray-900">
                        <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-center [&>th]:text-md [&>th]:font-semibold [&>th]:text-gray-300 [&>th]:h-12">
                            <th className="">이벤트명</th>
                            <th className="">
                                <DesktopGenreFilter
                                    selectedGenres={selectedGenres}
                                    onGenreChange={onGenreChange}
                                />
                            </th>
                            <th className="">장소</th>
                            <th>일정</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {events.length > 0 ? (
                            events.map(item => (
                                <tr
                                    key={item.id}
                                    onClick={() => onEventSelect(item)}
                                    className="cursor-pointer hover:bg-gray-700 [&>td]:text-sm [&>td]:font-medium [&>td]:text-gray-300 [&>td]:whitespace-nowrap [&>td]:pl-4 [&>td]:py-4 [&>td]:px-6"
                                >
                                    <td className="flex items-center">
                                        {item.img_url ? (
                                            <img
                                                src={item.img_url.replace(
                                                    /(name=)[^&]*/,
                                                    "$1small"
                                                )}
                                                alt={item.event_name}
                                                className="h-[50px] w-[50px] max-w-[50px] rounded-full mr-3 object-cover"
                                            />
                                        ) : (
                                            <img
                                                src="./dummy.svg"
                                                alt="Dummy"
                                                className="h-[50px] w-[50px] max-w-[50px] rounded-full mr-3 object-cover"
                                            />
                                        )}
                                        <div className="overflow-hidden text-left whitespace-nowrap text-ellipsis">
                                            {item.event_name}
                                        </div>
                                    </td>
                                    <td className="w-[300px]">
                                        <GenreTag genre={item.genre} />
                                    </td>
                                    <td className="w-[300px]">
                                        <LocationLink
                                            location={item.location}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>
                                        {formatDate(item.schedule, item.time_start)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="py-8 text-center text-gray-400"
                                >
                                    선택한 장르의 이벤트가 존재하지 않습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {/* Mobile Genre Filter */}
                <MobileGenreFilter
                    selectedGenres={selectedGenres}
                    onGenreChange={onGenreChange}
                />

                {/* Event Cards */}
                {events.length > 0 ? (
                    events.map(item => (
                        <EventCard
                            key={item.id}
                            event={item}
                            onEventSelect={onEventSelect}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400 bg-gray-800 rounded-lg">
                        선택한 장르의 이벤트가 존재하지 않습니다.
                    </div>
                )}
            </div>
        </div>
    );
};