import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const isInitial = useRef(true);
  const silentSignOut = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (isInitial.current) {
        isInitial.current = false;
      } else if (nextUser) {
        toast.success("로그인되었습니다.");
      } else if (silentSignOut.current) {
        silentSignOut.current = false;
      } else {
        toast.info("로그아웃되었습니다.");
      }

      setUser(nextUser);
      // signInWithGoogle 진행 중 상태를 여기서 해제 — 로그인 팝업이 닫힌 시점이 아니라
      // onAuthStateChanged가 실제로 새 유저를 확정한 시점에 맞춰야 헤더 버튼이
      // "로그인"으로 잠깐 되돌아가는 깜빡임 없이 "내 메뉴"로 바로 전환됨
      setAuthenticating(false);

      if (!nextUser) {
        setClaims(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await nextUser.getIdTokenResult(true);
        setClaims(tokenResult?.claims ?? null);
      } catch {
        setClaims(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async ({ silent = false } = {}) => {
    if (silent) silentSignOut.current = true;
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async (idToken) => {
    setAuthenticating(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (err) {
      setAuthenticating(false);
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      user,
      claims,
      loading,
      authenticating,
      isLoggedIn: Boolean(user),
      role: claims?.role ?? null,
      signOut,
      signInWithGoogle,
    }),
    [user, claims, loading, authenticating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

