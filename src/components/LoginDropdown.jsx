import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";
import { getSuspensionReason } from "../utils/adminApi";
import SuspendedModal from "./SuspendedModal";

export default function LoginDropdown({
  onClose,
  position = "bottom",
  align = "right",
}) {
  const [suspended, setSuspended] = useState(null);
  const clientIdPresent = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;

    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      onClose();
    } catch (err) {
      if (err.code === "auth/user-disabled") {
        try {
          const base64 = idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const { email } = JSON.parse(atob(base64));
          const data = await getSuspensionReason(email);
          setSuspended({ reason: data.reason || "" });
        } catch {
          setSuspended({ reason: "" });
        }
      } else {
        alert("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const positionClass = position === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const alignClass = align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  return (
    <>
      <div
        className={`absolute ${alignClass} ${positionClass} z-50 w-72 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-xl p-4`}
      >
        <div className="flex items-center gap-2 mb-3">
          <img src="/favicon.svg" alt="ANKR 로고" className="w-5 h-5" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ANKR.KR 로그인 (베타)
          </span>
        </div>

        {!clientIdPresent && (
          <div className="mb-3 rounded-lg border border-amber-300/70 bg-amber-50 dark:border-amber-600/40 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
            VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다.
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              alert("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }}
          />
        </div>

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Google로 로그인하면{" "}
          <Link to="/terms" onClick={onClose} className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            이용약관
          </Link>{" "}
          및{" "}
          <Link to="/privacy" onClick={onClose} className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            개인정보처리방침
          </Link>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>

      {suspended && (
        <SuspendedModal reason={suspended.reason} onClose={() => { setSuspended(null); onClose(); }} />
      )}
    </>
  );
}
