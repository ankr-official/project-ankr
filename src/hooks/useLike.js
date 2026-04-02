import { useState, useEffect } from "react";
import { ref, get, set, remove } from "firebase/database";
import { database } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useLike(eventId) {
  const { user } = useAuth();
  const [likeType, setLikeType] = useState(null); // null | "liked" | "attended"
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !eventId) {
      setLikeType(null);
      return;
    }
    get(ref(database, `likes/${user.uid}/${eventId}`))
      .then((snap) => {
        if (!snap.exists()) { setLikeType(null); return; }
        const val = snap.val();
        // 기존 true 값은 "liked"로 처리
        setLikeType(val === true ? "liked" : val);
      })
      .catch(() => {});
  }, [user?.uid, eventId]);

  const liked = likeType !== null;

  const toggle = async (type = "liked") => {
    if (!user?.uid || loading) return;
    setLoading(true);
    const likeRef = ref(database, `likes/${user.uid}/${eventId}`);
    if (liked) {
      const prev = likeType;
      setLikeType(null);
      try { await remove(likeRef); }
      catch { setLikeType(prev); }
    } else {
      setLikeType(type);
      try { await set(likeRef, type); }
      catch { setLikeType(null); }
    }
    setLoading(false);
  };

  return { liked, likeType, toggle };
}
