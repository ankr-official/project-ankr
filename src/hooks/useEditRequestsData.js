import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";

export const useEditRequestsData = () => {
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, "editRequests");
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((child) => {
          fetched.push({ id: child.key, ...child.val() });
        });
        setEditRequests(fetched);
        setLoading(false);
      },
      (error) => {
        console.error("editRequests fetch error:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  return { editRequests, loading };
};
