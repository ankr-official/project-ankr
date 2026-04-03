import { useScrollLock } from "../hooks/useScrollLock";

export default function SuspendedModal({ reason, onClose }) {
  useScrollLock(true);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl p-6 space-y-4">
        <div className="flex items-center  gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="pl-2 [&>*]:text-left [&>*]:w-full">
            <h3 className="font-bold text-gray-900 dark:text-white">
              계정이 정지되었습니다
            </h3>
            {reason && (
              <p className="mt-1 py-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                사유: {reason}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              문의: ankr.web.official@gmail.com
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}
