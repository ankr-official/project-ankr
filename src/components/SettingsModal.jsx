import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ref, get, remove, update } from "firebase/database";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { deleteSelf } from "../utils/adminApi";
import { useScrollLock } from "../hooks/useScrollLock";

export default function SettingsModal({ onClose }) {
  const { user, signOut } = useAuth();
  const [confirm, setConfirm] = useState(null); // null | "likes" | "nickname" | "activity" | "withdraw"
  const [loading, setLoading] = useState(false);
  const [activitySlug, setActivitySlug] = useState(null);
  const [hasLikes, setHasLikes] = useState(null);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      get(ref(database, `users/${user.uid}/activitySlug`)),
      get(ref(database, `likes/${user.uid}`)),
      get(ref(database, `users/${user.uid}/nickname`)),
    ]).then(([slugSnap, likesSnap, nickSnap]) => {
      setActivitySlug(slugSnap.val() || null);
      setHasLikes(likesSnap.exists());
      setNickname(nickSnap.val() || null);
    });
  }, [user?.uid]);
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
      onClose();
      toast.success("행사 기록이 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNickname = async () => {
    setLoading(true);
    try {
      await remove(ref(database, `users/${user.uid}/nickname`));
      setNickname(null);
      setConfirm(null);
      toast.success("닉네임이 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async () => {
    setLoading(true);
    try {
      const snap = await get(ref(database, `users/${user.uid}/activitySlug`));
      const slug = snap.val();
      await update(ref(database), {
        ...(slug ? { [`activitySlugs/${slug}`]: null } : {}),
        [`users/${user.uid}/activitySlug`]: null,
        [`users/${user.uid}/historyPublic`]: null,
        [`users/${user.uid}/publicActivity`]: null,
        [`users/${user.uid}/hiddenEvents`]: null,
      });
      onClose();
      toast.success("활동 페이지가 삭제되었습니다.");
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
          {/* 활동 페이지 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              내 활동
            </h3>
            {/* 닉네임 삭제 */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  닉네임 삭제
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {nickname ? (
                    <>현재: <span className="font-medium text-gray-700 dark:text-gray-300">{nickname}</span></>
                  ) : (
                    "설정된 닉네임이 없습니다."
                  )}
                </p>
              </div>
              <div className="relative flex-shrink-0 ml-4 group">
                <button
                  onClick={() => setConfirm(confirm === "nickname" ? null : "nickname")}
                  disabled={!nickname}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  삭제
                </button>
                {!nickname && (
                  <div className="absolute right-0 bottom-full mb-2 w-max max-w-[160px] px-2.5 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    설정된 닉네임이 없습니다.
                  </div>
                )}
              </div>
            </div>
            {confirm === "nickname" && (
              <div className="mt-3 mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  닉네임 <span className="font-medium">"{nickname}"</span>을 삭제하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteNickname}
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
            <hr className="border-gray-100 dark:border-gray-800" />
            {/* 활동 페이지 삭제 */}
            <div className="flex items-center justify-between pt-3 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  활동 페이지 삭제
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  주소·공개 설정이 삭제됩니다. 행사 기록은 유지됩니다.
                </p>
              </div>
              <div className="relative flex-shrink-0 ml-4 group">
                <button
                  onClick={() =>
                    setConfirm(confirm === "activity" ? null : "activity")
                  }
                  disabled={!activitySlug}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  삭제
                </button>
                {!activitySlug && (
                  <div className="absolute right-0 bottom-full mb-2 w-max max-w-[160px] px-2.5 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    활동 페이지가 설정되지 않았습니다.
                  </div>
                )}
              </div>
            </div>
            {confirm === "activity" && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  활동 페이지를 삭제하면 공개 주소(
                  <span className="font-medium">/@{activitySlug}</span>)가
                  삭제됩니다. 행사 기록은 남습니다. 계속하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteActivity}
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
            <hr className="border-gray-100 dark:border-gray-800" />
            {/* 행사 기록 전체 삭제 */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  행사 기록 전체 삭제
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  관심 행사 및 다녀온 행사 기록이 모두 삭제됩니다.
                </p>
              </div>
              <div className="relative flex-shrink-0 ml-4 group">
                <button
                  onClick={() => setConfirm(confirm === "likes" ? null : "likes")}
                  disabled={!hasLikes}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  삭제
                </button>
                {!hasLikes && (
                  <div className="absolute right-0 bottom-full mb-2 w-max max-w-[160px] px-2.5 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    등록된 행사 기록이 없습니다.
                  </div>
                )}
              </div>
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
                className="flex-shrink-0 ml-4 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-900/20 dark:mouse:hover:bg-red-900/20 transition-colors"
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
