import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";

export const useReportsData = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, "reports");
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const fetched = [];
      snapshot.forEach((child) => {
        fetched.push({ id: child.key, ...child.val() });
      });
      setReports(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { reports, loading };
};
