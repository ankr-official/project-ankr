import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";
import { getSuspensionReason } from "../utils/adminApi";
import SuspendedModal from "../components/SuspendedModal";

export default function Login() {
  const navigate = useNavigate();
  const [suspended, setSuspended] = useState(null);

  const clientIdPresent = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;

    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      navigate("/");
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 dark:bg-white/5 border border-gray-200/70 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-col items-center gap-3 mb-4">
          <img src="/favicon.svg" alt="ANKR 로고" className="w-10 h-10" />
          <div className="w-full">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              ANKR.KR 로그인 (베타)
            </div>
          </div>
        </div>

        {!clientIdPresent && (
          <div className="mb-4 rounded-lg border border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 text-sm">
            `VITE_GOOGLE_CLIENT_ID`가 설정되지 않았습니다. 로그인 버튼이
            동작하지 않습니다.
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            useOneTap
            onSuccess={handleSuccess}
            onError={() => {
              alert("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }}
          />
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-lg px-4 py-2 text-sm bg-gray-200/80 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={() => navigate("/")}
        >
          홈으로 돌아가기
        </button>
      </div>

      {suspended && (
        <SuspendedModal reason={suspended.reason} onClose={() => setSuspended(null)} />
      )}
    </div>
  );
}
