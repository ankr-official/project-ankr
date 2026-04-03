import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ref, remove } from "firebase/database";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { deleteSelf } from "../utils/adminApi";
import { useScrollLock } from "../hooks/useScrollLock";

export default function SettingsModal({ onClose }) {
  const { user, signOut } = useAuth();
  const [confirm, setConfirm] = useState(null); // null | "likes" | "withdraw"
  const [loading, setLoading] = useState(false);
  useScrollLock(true);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleClearLikes = async () => {
    setLoading(true);
    try {
      await remove(ref(database, `likes/${user.uid}`));
      toast.success("행사 기록이 삭제되었습니다.");
      window.location.reload();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await deleteSelf();
      await signOut({ silent: true });
      onClose();
      toast.success("탈퇴가 완료되었습니다.");
    } catch {
      toast.error("탈퇴 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            설정
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-left">
          {/* 행사 기록 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              행사 기록
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  행사 기록 전체 삭제
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  관심 행사 및 다녀온 행사 기록이 모두 삭제됩니다.
                </p>
              </div>
              <button
                onClick={() => setConfirm(confirm === "likes" ? null : "likes")}
                className="flex-shrink-0 ml-4 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors"
              >
                삭제
              </button>
            </div>
            {confirm === "likes" && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  모든 행사 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수
                  없습니다.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearLikes}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg active:bg-red-700 mouse:hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "삭제 중..." : "확인"}
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 계정 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              계정
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  회원 탈퇴
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  계정 및 모든 데이터가 영구 삭제됩니다.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  *언제든지 재가입 가능합니다.
                </p>
              </div>
              <button
                onClick={() =>
                  setConfirm(confirm === "withdraw" ? null : "withdraw")
                }
                className="flex-shrink-0 ml-4 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors"
              >
                탈퇴
              </button>
            </div>
            {confirm === "withdraw" && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  탈퇴 시 계정과 행사 기록 등 모든 데이터가 영구 삭제되며 복구할
                  수 없습니다. 정말 탈퇴하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg active:bg-red-700 mouse:hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "처리 중..." : "탈퇴 확인"}
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
