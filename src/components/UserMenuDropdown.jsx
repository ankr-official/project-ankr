import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";

export default function UserMenuDropdown({
  onClose,
  onSettings,
  onActivitySetup,
}) {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();

  const handleActivity = () => {
    onClose();
    navigate("/activity");
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
    <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xl overflow-hidden">
      {(role === "admin" || role === "owner") && (
        <button
          onClick={handleAdmin}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-none text-indigo-600 dark:text-indigo-400 active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
        >
          <ShieldCheckIcon className="w-4 h-4" />
          관리자
        </button>
      )}
      <button
        onClick={handleActivity}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-none text-gray-700 dark:text-gray-300 active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
      >
        <Square2StackIcon className="w-4 h-4" />내 활동
      </button>
      <button
        onClick={handleSettings}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-none text-gray-700 dark:text-gray-300 active:bg-gray-50 mouse:hover:bg-gray-50 dark:active:bg-gray-800 dark:mouse:hover:bg-gray-800 transition-colors"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        설정
      </button>
      <div className="border-t border-gray-200/70 dark:border-gray-800" />
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-none text-red-600 dark:text-red-400 active:bg-red-50 mouse:hover:bg-red-50 dark:active:bg-red-950/30 dark:mouse:hover:bg-red-950/30 transition-colors"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
        로그아웃
      </button>
    </div>
  );
}
