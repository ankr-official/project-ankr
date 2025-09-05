import { GENRE_COLORS } from "../../constants";

export const MobileGenreFilter = ({ selectedGenres, onGenreChange }) => {
    return (
        <div className="sticky top-0 z-10 p-2 bg-gray-900 bg-opacity-50 rounded-lg shadow-md backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
                {[
                    "all",
                    ...Object.keys(GENRE_COLORS).filter(
                        genre => genre !== "default"
                    ),
                ].map(genre => (
                    <button
                        key={genre}
                        onClick={() => onGenreChange(genre)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                            selectedGenres.includes(genre)
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                        {genre === "all" ? "전체" : genre}
                    </button>
                ))}
            </div>
        </div>
    );
};