import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";

export const useRealtimeData = (path) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, path);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((child) => {
          fetched.push({ id: child.key, ...child.val() });
        });
        setData(fetched);
        setLoading(false);
      },
      (error) => {
        console.error(`useRealtimeData(${path}) error:`, error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [path]);

  return { data, loading };
};
