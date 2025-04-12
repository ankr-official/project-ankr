import { GENRE_COLORS } from "../../constants";

export const GenreTag = ({ genre }) => {
    const genres = genre.split(",").map(g => g.trim());
    const definedGenres = genres.filter(g => GENRE_COLORS[g]);
    const undefinedGenres = genres.filter(g => !GENRE_COLORS[g]);
    const sortedGenres = [...undefinedGenres, ...definedGenres];

    return (
        <div className="flex flex-wrap gap-1">
            {sortedGenres.map((g, index) => (
                <span
                    key={index}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${GENRE_COLORS[g] || GENRE_COLORS.default}`}
                >
                    {g}
                </span>
            ))}
        </div>
    );
};
