import { useState, useRef, useEffect } from "react";

export function AutocompleteInput({
    value,
    onChange,
    onSelect,
    suggestions = [],
    className,
    disabled,
    inputRef,
    ...rest
}) {
    const { onKeyDown: externalKeyDown, ...inputRest } = rest;
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef(null);

    const filtered = suggestions.filter(
        s =>
            s.toLowerCase().includes((value ?? "").toLowerCase()) &&
            s !== value,
    );

    // 활성 항목이 바뀌면 스크롤 위치 맞춤
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            listRef.current.children[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [activeIndex]);

    const handleChange = e => {
        onChange(e.target.value);
        setOpen(e.target.value.length > 0);
        setActiveIndex(-1);
    };

    const handleKeyDown = e => {
        if (e.isComposing || e.keyCode === 229) return; // IME 조합 중 무시
        if (!open || filtered.length === 0) {
            externalKeyDown?.(e);
            return;
        }

        if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
            e.preventDefault();
            setActiveIndex(
                activeIndex < 0 ? 0 : (activeIndex + 1) % filtered.length,
            );
        } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
            e.preventDefault();
            setActiveIndex(
                activeIndex <= 0 ? filtered.length - 1 : activeIndex - 1,
            );
        } else if ((e.key === "Enter" || e.key === " ") && activeIndex >= 0) {
            e.preventDefault();
            onChange(filtered[activeIndex]);
            onSelect?.(filtered[activeIndex]);
            setOpen(false);
            setActiveIndex(-1);
        } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
        } else {
            externalKeyDown?.(e);
        }
    };

    const handleSelect = s => {
        onChange(s);
        onSelect?.(s);
        setOpen(false);
        setActiveIndex(-1);
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={() =>
                    setTimeout(() => {
                        setOpen(false);
                        setActiveIndex(-1);
                    }, 150)
                }
                disabled={disabled}
                className={className}
                autoComplete="off"
                {...inputRest}
            />
            {open && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    className="overflow-y-auto absolute z-10 mt-1 w-full max-h-48 text-sm text-left bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700"
                >
                    {filtered.map((s, i) => (
                        <li
                            key={s}
                            onMouseDown={() => handleSelect(s)}
                            className={`px-3 py-2 cursor-pointer transition-colors text-gray-900 dark:text-white ${
                                i === activeIndex
                                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                                    : "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300"
                            }`}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
