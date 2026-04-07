import { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { database } from "../config/firebase";

const CURRENT_YEAR = new Date().getFullYear();

export const useYearEventData = () => {
  const [yearData, setYearData] = useState({});
  const [loadedYears, setLoadedYears] = useState(new Set());
  const [loadingYears, setLoadingYears] = useState(new Set());
  const [knownYears, setKnownYears] = useState([CURRENT_YEAR]);
  const [loading, setLoading] = useState(true);

  // 전체 연도 목록 메타데이터 1회 조회
  useEffect(() => {
    get(ref(database, "data_v3/meta/years")).then((snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const years = Array.isArray(val) ? val : Object.values(val);
        setKnownYears(years.sort((a, b) => b - a));
      }
    });
  }, []);

  // 현재 연도만 실시간 구독
  useEffect(() => {
    const unsubscribe = onValue(
      ref(database, `data_v3/${CURRENT_YEAR}`),
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((child) => {
          fetched.push({ id: child.key, ...child.val() });
        });
        setYearData((prev) => ({ ...prev, [CURRENT_YEAR]: fetched }));
        setLoadedYears((prev) => new Set([...prev, CURRENT_YEAR]));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsubscribe();
  }, []);

  const loadYear = async (year) => {
    if (
      year === CURRENT_YEAR ||
      loadedYears.has(year) ||
      loadingYears.has(year)
    )
      return;
    setLoadingYears((prev) => new Set([...prev, year]));
    try {
      const snapshot = await get(ref(database, `data_v3/${year}`));
      const fetched = [];
      snapshot.forEach((child) => {
        fetched.push({ id: child.key, ...child.val() });
      });
      setYearData((prev) => ({ ...prev, [year]: fetched }));
      setLoadedYears((prev) => new Set([...prev, year]));
    } catch (err) {
      console.error(`useYearEventData loadYear(${year}) error:`, err);
    } finally {
      setLoadingYears((prev) => {
        const next = new Set(prev);
        next.delete(year);
        return next;
      });
    }
  };

  const allData = Object.values(yearData).flat();

  return {
    allData,
    yearData,
    knownYears,
    loadedYears,
    loadingYears,
    loadYear,
    loading,
  };
};
