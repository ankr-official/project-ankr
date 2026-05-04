import { useState, useEffect, useRef, useMemo } from "react";
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

  // React state updates are async — use refs for synchronous concurrent-call guards
  const loadingYearsRef = useRef(new Set());
  const loadedYearsRef = useRef(new Set());

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
        loadedYearsRef.current.add(CURRENT_YEAR);
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
      loadedYearsRef.current.has(year) ||
      loadingYearsRef.current.has(year)
    )
      return;
    loadingYearsRef.current.add(year);
    setLoadingYears((prev) => new Set([...prev, year]));
    try {
      const snapshot = await get(ref(database, `data_v3/${year}`));
      const fetched = [];
      snapshot.forEach((child) => {
        fetched.push({ id: child.key, ...child.val() });
      });
      setYearData((prev) => {
        const fetchedIds = new Set(fetched.map((e) => e.id));
        const localOnly = (prev[year] || []).filter((e) => !fetchedIds.has(e.id));
        return { ...prev, [year]: [...fetched, ...localOnly] };
      });
      loadedYearsRef.current.add(year);
      setLoadedYears((prev) => new Set([...prev, year]));
    } catch (err) {
      console.error(`useYearEventData loadYear(${year}) error:`, err);
    } finally {
      loadingYearsRef.current.delete(year);
      setLoadingYears((prev) => {
        const next = new Set(prev);
        next.delete(year);
        return next;
      });
    }
  };

  // 중복 ID 방어 (StrictMode 이중 실행 등으로 인한 중복 진입 방지)
  const allData = useMemo(() => {
    const flat = Object.values(yearData).flat();
    const seen = new Set();
    return flat.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [yearData]);

  // metaLoaded 전까지는 allYearsLoaded=false 유지 (조기 완료 판정 방지)
  const allYearsLoaded =
    metaLoaded &&
    knownYears.length > 0 &&
    knownYears.every((y) => loadedYearsRef.current.has(y));

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

  const addLocalEvent = (year, id, data) => {
    if (year === CURRENT_YEAR) return; // 현재 연도는 onValue가 자동 처리
    setYearData((prev) => {
      if ((prev[year] || []).some((e) => e.id === id)) return prev; // 이미 존재하면 추가 안 함
      return {
        ...prev,
        [year]: [...(prev[year] || []), { id, ...data }],
      };
    });
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
    addLocalEvent,
    removeLocalEvent,
  };
};
