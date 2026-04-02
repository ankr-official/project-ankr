import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const value = useMemo(
    () => ({
      user,
      claims,
      loading,
      isLoggedIn: Boolean(user),
      role: claims?.role ?? null,
      signOut,
    }),
    [user, claims, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

