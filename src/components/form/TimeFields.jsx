import { inputClass } from "../../utils/eventFormUtils";

const TIME_FIELDS = [
    ["time_entrance", "입장"],
    ["time_start", "시작"],
    ["time_end", "종료"],
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const selectClass =
    "w-full px-2 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-300/70 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors appearance-none text-center cursor-pointer";

function TimePicker({ value, onChange }) {
    const [hh, mm] = value ? value.split(":") : ["", ""];

    const handleHour = e => {
        const h = e.target.value;
        if (!h) { onChange(""); return; }
        onChange(`${h}:${mm || "00"}`);
    };

    const handleMinute = e => {
        const m = e.target.value;
        if (!m) { onChange(""); return; }
        onChange(`${hh || "00"}:${m}`);
    };

    return (
        <div className="flex gap-1 items-center">
            <select value={hh} onChange={handleHour} className={selectClass}>
                <option value="">--</option>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-gray-400 dark:text-gray-500 shrink-0">:</span>
            <select value={mm} onChange={handleMinute} className={selectClass}>
                <option value="">--</option>
                {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
    );
}

export function TimeFields({ value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                시간 정보{" "}
                <span className="text-xs text-gray-400">(선택)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left sm:text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 p-3 sm:pt-1">
                {TIME_FIELDS.map(([field, label]) => (
                    <div key={field} className="space-y-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 pl-2 sm:pl-0">
                            {label}
                        </span>
                        <TimePicker
                            value={value[field]}
                            onChange={v => onChange(field, v)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
