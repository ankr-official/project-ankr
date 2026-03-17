import { useState } from "react";

export function AutocompleteInput({ value, onChange, suggestions = [], className, disabled, ...rest }) {
    const [open, setOpen] = useState(false);

    const filtered = suggestions.filter(
        s => s.toLowerCase().includes((value ?? "").toLowerCase()) && s !== value,
    );

    return (
        <div className="relative">
            <input
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                    setOpen(e.target.value.length > 0);
                }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                disabled={disabled}
                className={className}
                autoComplete="off"
                {...rest}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full text-left max-h-48 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg text-sm">
                    {filtered.map(s => (
                        <li
                            key={s}
                            onMouseDown={() => { onChange(s); setOpen(false); }}
                            className="px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 text-gray-900 dark:text-white transition-colors"
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
