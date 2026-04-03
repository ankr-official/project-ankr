import { CheckCircleIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "../hooks/useScrollLock";

export default function LikeConfirmModal({ onAttended, onLiked, onClose }) {
  useScrollLock(true);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            이 행사를 어떻게 기록할까요?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            이미 지난 행사예요.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-6 pb-6">
          <button
            onClick={onAttended}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm font-medium"
          >
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
            다녀온 행사예요
          </button>
          <button
            onClick={onLiked}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <HeartIcon className="w-5 h-5 shrink-0" />
            그냥 관심 행사예요
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 dark:text-gray-600 mt-1 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
