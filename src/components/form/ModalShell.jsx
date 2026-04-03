import { useScrollLock } from "../../hooks/useScrollLock";

export function ModalShell({
    onClose,
    zIndex = 50,
    maxHeight = "calc(100dvh - 8rem)",
    children,
}) {
    useScrollLock(true);
    return (
        <div
            style={{ zIndex }}
            className="fixed inset-0 flex items-start justify-center p-4 sm:p-6 sm:items-center bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={onClose}
        >
            <div
                style={{ maxHeight }}
                className="relative w-full max-w-2xl my-4 sm:my-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function ModalCloseButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}
