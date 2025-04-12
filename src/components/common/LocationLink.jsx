import { getNaverMapUrl } from "../../utils/urlUtils";

export const LocationLink = ({ location, onClick }) => (
    <a
        href={getNaverMapUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-600 rounded-full lg:hover:text-indigo-300 lg:hover:underline"
        onClick={onClick}
    >
        {location}
    </a>
);
