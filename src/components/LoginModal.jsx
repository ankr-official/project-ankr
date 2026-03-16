import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginModal({ onClose }) {
  const clientIdPresent = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="ANKR 로고" className="w-8 h-8" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ANKR.KR 로그인 (베타)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!clientIdPresent && (
          <div className="mb-4 rounded-lg border border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 text-sm">
            `VITE_GOOGLE_CLIENT_ID`가 설정되지 않았습니다. 로그인 버튼이 동작하지 않습니다.
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            useOneTap
            onSuccess={(credentialResponse) => {
              const idToken = credentialResponse?.credential;
              if (!idToken) return;
              const credential = GoogleAuthProvider.credential(idToken);
              signInWithCredential(auth, credential).then(() => {
                onClose();
              });
            }}
            onError={() => {
              alert("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }}
          />
        </div>
      </div>
    </div>
  );
}
