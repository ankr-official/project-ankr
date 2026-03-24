import { GENRE_COLORS } from "../../constants";
import { GENRES } from "../../utils/eventFormUtils";

export const GenreTag = ({ genre }) => {
    const genres = genre.split(",").map(g => g.trim());
    const sortedGenres = [...genres].sort((a, b) => {
        const ia = GENRES.indexOf(a);
        const ib = GENRES.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
    });

    return (
        <div className="flex flex-wrap justify-start gap-1">
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
