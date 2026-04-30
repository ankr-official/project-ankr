import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { XMarkIcon, AtSymbolIcon } from "@heroicons/react/24/outline";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useScrollLock } from "../hooks/useScrollLock";
import { RESERVED_SLUGS, RESERVED_NICKNAMES } from "../constants";
import { toast } from "react-toastify";

const isValidSlug = (s) => {
  if (!s || s.length < 3 || s.length > 20) return false;
  if (!/^[a-z0-9]/.test(s) || !/[a-z0-9]$/.test(s)) return false;
  return /^[a-z0-9_-]+$/.test(s);
};

const SLUG_STATUS = {
  checking:  { text: "확인 중...", color: "text-gray-400 dark:text-gray-500" },
  available: { text: "사용 가능한 주소입니다.", color: "text-green-500" },
  taken:     { text: "이미 사용 중인 주소입니다.", color: "text-red-500" },
  reserved:  { text: "사용할 수 없는 주소입니다.", color: "text-red-500" },
  invalid:   { text: "3~20자, 영문 소문자·숫자·하이픈·언더바 (첫·끝은 영문·숫자).", color: "text-red-500" },
};

export default function ActivitySetupModal({ onClose }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  useScrollLock(true);

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState(null);
  const [slugInput, setSlugInput] = useState("");
  const [slugStatus, setSlugStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const slugTimer = useRef(null);

  const handleSlugChange = (raw) => {
    const val = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setSlugInput(val);
    setSlugStatus(null);
    clearTimeout(slugTimer.current);
    if (!val) return;
    if (!isValidSlug(val)) { setSlugStatus("invalid"); return; }
    const isPrivileged = role === "owner" || role === "admin";
    if (!isPrivileged && RESERVED_SLUGS.some(w => val.includes(w))) { setSlugStatus("reserved"); return; }
    setSlugStatus("checking");
    slugTimer.current = setTimeout(async () => {
      const snap = await get(ref(database, `activitySlugs/${val}`));
      setSlugStatus(snap.exists() ? "taken" : "available");
    }, 400);
  };

  const handleNicknameChange = (val) => {
    setNickname(val);
    if (!val.trim()) { setNicknameError(null); return; }
    const isPrivileged = role === "owner" || role === "admin";
    const lower = val.trim().toLowerCase();
    if (!isPrivileged && RESERVED_NICKNAMES.some(w => lower.includes(w.toLowerCase()))) {
      setNicknameError("사용할 수 없는 닉네임입니다.");
    } else {
      setNicknameError(null);
    }
  };

  const handleSubmit = async () => {
    if (slugStatus !== "available" || saving || !user) return;
    if (nicknameError) return;
    setSaving(true);
    try {
      const snap = await get(ref(database, `activitySlugs/${slugInput}`));
      if (snap.exists()) { setSlugStatus("taken"); setSaving(false); return; }
      const updates = {
        [`activitySlugs/${slugInput}`]: user.uid,
        [`users/${user.uid}/activitySlug`]: slugInput,
      };
      if (nickname.trim()) {
        updates[`users/${user.uid}/nickname`] = nickname.trim();
      }
      await update(ref(database), updates);
      onClose();
      navigate("/activity");
      toast.success("내 활동 페이지가 만들어졌습니다!");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
      setSaving(false);
    }
  };

  const statusInfo = SLUG_STATUS[slugStatus];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/70 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <AtSymbolIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              내 활동 페이지 만들기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 active:bg-gray-100 mouse:hover:bg-gray-100 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-left">
          {/* 닉네임 */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              닉네임{" "}
              <span className="normal-case font-normal">(선택)</span>
            </label>
            <input
              autoFocus
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
              maxLength={20}
              placeholder="나를 부를 이름"
              className={`w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border focus:outline-none transition-colors ${
                nicknameError
                  ? "border-red-400 dark:border-red-600 focus:border-red-400"
                  : "border-gray-200 dark:border-gray-700 focus:border-indigo-400 dark:focus:border-indigo-500"
              }`}
            />
            {nicknameError && (
              <p className="text-xs mt-1.5 px-1 text-red-500">{nicknameError}</p>
            )}
          </div>

          {/* 활동 주소 */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              활동 주소{" "}
              <span className="normal-case font-normal text-red-400">*필수</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
                ankr.kr/activity/
              </span>
              <input
                value={slugInput}
                onChange={(e) => handleSlugChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
                maxLength={20}
                placeholder="my-page"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </div>
            {statusInfo ? (
              <p className={`text-xs mt-1.5 px-1 ${statusInfo.color}`}>{statusInfo.text}</p>
            ) : (
              <p className="text-xs mt-1.5 px-1 text-gray-400 dark:text-gray-500">
                한 번 설정하면 링크로 공유할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={slugStatus !== "available" || saving}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white active:bg-indigo-700 mouse:hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "만드는 중..." : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}
