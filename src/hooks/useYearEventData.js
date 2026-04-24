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
  const [metaLoaded, setMetaLoaded] = useState(false);

  // 전체 연도 목록 메타데이터 1회 조회
  useEffect(() => {
    get(ref(database, "data_v3/meta/years"))
      .then((snap) => {
        if (snap.exists()) {
          const val = snap.val();
          const years = Array.isArray(val) ? val : Object.values(val);
          setKnownYears(years.sort((a, b) => b - a));
        }
        setMetaLoaded(true);
      })
      .catch(() => setMetaLoaded(true));
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

  // metaLoaded 전까지는 allYearsLoaded=false 유지 (조기 완료 판정 방지)
  const allYearsLoaded =
    metaLoaded &&
    knownYears.length > 0 &&
    knownYears.every((y) => loadedYears.has(y));

  const loadAllYears = () => {
    knownYears.forEach((y) => loadYear(y));
  };

  // 과거 연도(get()로 1회 조회)는 onValue 구독이 없으므로 저장/삭제 후 로컬 state를 직접 패치
  const updateLocalEvent = (year, id, newData) => {
    if (year === CURRENT_YEAR) return; // 현재 연도는 onValue가 자동 처리
    setYearData((prev) => ({
      ...prev,
      [year]: (prev[year] || []).map((e) =>
        e.id === id ? { ...e, ...newData } : e,
      ),
    }));
  };

  const removeLocalEvent = (year, id) => {
    if (year === CURRENT_YEAR) return;
    setYearData((prev) => ({
      ...prev,
      [year]: (prev[year] || []).filter((e) => e.id !== id),
    }));
  };

  return {
    allData,
    yearData,
    knownYears,
    loadedYears,
    loadingYears,
    loadYear,
    loadAllYears,
    allYearsLoaded,
    metaLoaded,
    loading,
    updateLocalEvent,
    removeLocalEvent,
  };
};
