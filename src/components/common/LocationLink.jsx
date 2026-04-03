import { getNaverMapUrl } from "../../utils/urlUtils";

export const LocationLink = ({ location, onClick }) => {
    const isUndefined =
        location === "장소 미정" ||
        location === "장소 비공개" ||
        location === "VRChat" ||
        location === "온라인";

    if (isUndefined) {
        return (
            <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors">
                {location}
            </span>
        );
    }

    return (
        <a
            href={getNaverMapUrl(location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block max-w-full px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-300 dark:bg-gray-600 rounded-full truncate active:text-indigo-600 mouse:hover:text-indigo-600 dark:active:text-indigo-300 dark:mouse:hover:text-indigo-300 active:underline mouse:hover:underline transition-colors"
            onClick={onClick}
        >
            {location}
        </a>
    );
};
