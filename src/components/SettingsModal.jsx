import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function SettingsModal({ onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 dark:bg-gray-500/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">설정</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
          준비 중입니다.
        </div>
      </div>
    </div>
  );
}
