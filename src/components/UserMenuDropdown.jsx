import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function UserMenuDropdown({ onClose, onSettings }) {
  const navigate = useNavigate();
  const { signOut, role } = useAuth();

  const handleLiked = () => {
    onClose();
    navigate("/liked");
  };

  const handleAdmin = () => {
    onClose();
    navigate("/admin");
  };

  const handleSettings = () => {
    onClose();
    onSettings();
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xl overflow-hidden">
      {(role === "admin" || role === "owner") && (
        <button
          onClick={handleAdmin}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <ShieldCheckIcon className="w-4 h-4" />
          관리자
        </button>
      )}
      <button
        onClick={handleLiked}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <HeartIcon className="w-4 h-4" />
        관심 행사
      </button>
      {/* <button
        onClick={handleSettings}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        설정
      </button> */}
      <div className="border-t border-gray-200/70 dark:border-gray-800" />
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
        로그아웃
      </button>
    </div>
  );
}
