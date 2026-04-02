import { useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../contexts/AuthContext";
import { useLike } from "../../hooks/useLike";
import LoginDropdown from "../LoginDropdown";
import LikeConfirmModal from "../LikeConfirmModal";

export function HeartButton({
  eventId,
  eventDate,
  className = "",
  buttonClassName = "",
  label,
}) {
  const { isLoggedIn } = useAuth();
  const { liked, toggle } = useLike(eventId);
  const [showLogin, setShowLogin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isPast = () => {
    if (!eventDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(eventDate) < today;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLogin((prev) => !prev);
      return;
    }
    if (liked) {
      toggle();
      return;
    }
    if (isPast()) {
      setShowConfirm(true);
      return;
    }
    toggle("liked");
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <button
          onClick={handleClick}
          className={`group flex items-center justify-center p-0 ${buttonClassName}`}
          aria-label={liked ? "관심 행사 취소" : "관심 행사 등록"}
        >
          {liked ? (
            <HeartSolid className="w-6 h-6 text-red-500 lg:group-hover:scale-110 transition-transform" />
          ) : (
            <HeartIcon className="w-6 h-6 text-gray-300 dark:text-gray-500 lg:group-hover:scale-110 transition-transform" />
          )}
          {label && <span>{label}</span>}
        </button>
        {showLogin && (
          <LoginDropdown
            position="bottom"
            align="right"
            onClose={() => setShowLogin(false)}
          />
        )}
      </div>
      {showConfirm && (
        <LikeConfirmModal
          onAttended={() => {
            toggle("attended");
            setShowConfirm(false);
          }}
          onLiked={() => {
            toggle("liked");
            setShowConfirm(false);
          }}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
