import { GENRE_COLORS } from "../constants";
import { toKSTDate } from "./dateUtils";

export const GENRES = Object.keys(GENRE_COLORS).filter(g => g !== "default");

export const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors appearance-none";

export const isoToTime = iso => {
    if (!iso) return "";
    try {
        const kst = toKSTDate(iso);
        if (isNaN(kst)) return "";
        const pad = n => String(n).padStart(2, "0");
        return `${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`;
    } catch {
        return "";
    }
};

export const isoToLocal = iso => {
    if (!iso) return "";
    try {
        const kst = toKSTDate(iso);
        if (isNaN(kst)) return iso.slice(0, 10);
        const pad = n => String(n).padStart(2, "0");
        return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}`;
    } catch {
        return iso.slice(0, 10);
    }
};

export const sortGenres = (genres) =>
    [...genres].sort((a, b) => {
        const ia = GENRES.indexOf(a);
        const ib = GENRES.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
    });

export const toArray = val => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string")
        return val.split(",").map(s => s.trim()).filter(Boolean);
    return Object.values(val);
};

export const timeToISO = (timeVal, scheduleDateStr) => {
    if (!timeVal) return null;
    const datePart = scheduleDateStr?.slice(0, 10) || new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    try {
        return new Date(`${datePart}T${timeVal}+09:00`).toISOString();
    } catch {
        return null;
    }
};

export const isValidUrl = url => {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

/** Parses fxtwitter API response into partial event form fields. */
export const parseTweetData = (tweet) => {
    const text = tweet.text || "";
    const result = {};

    // img_url: photo 우선, 없으면 video thumbnail
    const photo = tweet.media?.photos?.[0];
    const video = tweet.media?.videos?.[0];
    if (photo) {
        const m = photo.url.match(/\/media\/([^.?]+)(?:\.(\w+))?/);
        if (m) result.img_url = `https://pbs.twimg.com/media/${m[1]}?format=${m[2] || "jpg"}&name=large`;
    } else if (video?.thumbnail_url) {
        result.img_url = video.thumbnail_url;
    }

    // schedule: YYYY.MM.DD / YYYY/MM/DD / YYYY-MM-DD / YYYY년 MM월 DD일
    let m = text.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/)
           || text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (m) result.schedule = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;

    // time_start / time_end: 줄 단위로 스캔, 상단 우선 / 90분 이하 범위는 타임테이블 슬롯으로 건너뜀
    const normalizeTime = t => {
        const [h, min] = t.split(':');
        return `${String(parseInt(h) % 24).padStart(2, '0')}:${min}`;
    };
    const durationMin = (s, e) => {
        const [sh, sm] = s.split(':').map(Number);
        const [eh, em] = e.split(':').map(Number);
        const d = (eh * 60 + em) - (sh * 60 + sm);
        return d < 0 ? d + 1440 : d;
    };
    let firstRange = null;
    for (const tl of text.split('\n').map(l => l.trim()).filter(l => l)) {
        const rangeM = tl.match(/(\d{1,2}:\d{2})\s*[~-]\s*(\d{1,2}:\d{2})/);
        if (rangeM) {
            const s = normalizeTime(rangeM[1].padStart(5, '0'));
            const e = normalizeTime(rangeM[2].padStart(5, '0'));
            if (!firstRange) firstRange = { s, e };
            if (durationMin(s, e) <= 90) continue;
            result.time_start = s;
            result.time_end = e;
            break;
        }
        const timeM = tl.match(/(\d{1,2}:\d{2})/);
        if (timeM) {
            result.time_start = normalizeTime(timeM[1].padStart(5, '0'));
            break;
        }
    }
    if (!result.time_start && firstRange) {
        result.time_start = firstRange.s;
        result.time_end = firstRange.e;
    }

    // strip leading emojis helper
    const stripLeadingEmoji = s => s.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}️\s]+/gu, "").trim();

    const looksLikeDate = l =>
        /^\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(l) || /^\d{4}년\s*\d{1,2}월\s*\d{1,2}일/.test(l);
    const looksLikeTime = l => /^\d{1,2}:\d{2}/.test(l);

    // event_name: after 📝, or first quoted text, or first non-URL non-date line
    m = text.match(/📝\s*(.+)/);
    if (m) {
        result.event_name = m[1].trim();
    } else {
        m = text.match(/[「“””‘’『【](.+?)[」””’』】]/);
        if (m) {
            result.event_name = m[1].trim();
        } else {
            const line = text.split('\n').map(l => l.trim()).find(
                l => l && !/^https?:\/\//.test(l) && !looksLikeDate(l) && !looksLikeTime(l)
            );
            if (line) result.event_name = stripLeadingEmoji(line) || line;
        }
    }

    // location: 1) after 🗺️/📍  2) first non-time non-URL line after the date line
    m = text.match(/(?:🗺️?|📍)\s*(.+)/u);
    if (m) {
        result.location = m[1].trim();
    } else {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const dateLineIdx = lines.findIndex(l =>
            /\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(l) || /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/.test(l)
        );
        if (dateLineIdx !== -1) {
            for (let i = dateLineIdx + 1; i < lines.length; i++) {
                const next = lines[i];
                if (looksLikeTime(next)) continue;
                if (/^https?:\/\//.test(next) || /^[#@]/.test(next)) break;
                result.location = stripLeadingEmoji(next) || next;
                break;
            }
        }
    }

    return result;
};

/** Transforms common form fields into Firebase-ready data.
 *  Does NOT handle confirm, img_url, reason — each modal manages those. */
export const buildSubmitData = form => {
    const data = {
        ...form,
        genre: Array.isArray(form.genre) ? form.genre.join(", ") : form.genre || "",
        schedule: new Date(form.schedule).toISOString(),
        time_start: timeToISO(form.time_start, form.schedule),
        time_entrance: timeToISO(form.time_entrance, form.schedule),
        time_end: timeToISO(form.time_end, form.schedule),
    };
    if (!data.time_start) data.time_start = null;
    if (!data.time_entrance) data.time_entrance = null;
    if (!data.time_end) data.time_end = null;
    if (!data.etc) data.etc = null;
    return data;
};
