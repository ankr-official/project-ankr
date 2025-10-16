import { format, getYear } from "date-fns";

const API_KEY = import.meta.env.VITE_KASI_API_KEY;

const BASE_URL =
    "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService";

// API 응답을 파싱하는 함수
const parseHolidayResponse = xmlText => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const items = xmlDoc.getElementsByTagName("item");
    const holidays = {};

    Array.from(items).forEach(item => {
        const date = item.getElementsByTagName("locdate")[0]?.textContent;
        const name = item.getElementsByTagName("dateName")[0]?.textContent;
        if (date && name) {
            // YYYYMMDD 형식을 MMDD 형식으로 변환
            const monthDay = date.substring(4);
            // 해당 날짜에 이미 공휴일이 있으면 배열로 추가, 없으면 새 배열 생성
            holidays[monthDay] = holidays[monthDay]
                ? [...holidays[monthDay], name]
                : [name];
        }
    });

    return holidays;
};

// 타임아웃이 있는 fetch 함수
const fetchWithTimeout = async (url, timeout = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
            throw new Error("요청 시간 초과");
        }
        throw error;
    }
};

// 재시도 로직이 포함된 API 호출 함수
const fetchWithRetry = async (url, maxRetries = 2, retryDelay = 5000) => {
    let lastError;
    let attempt = 0;

    while (attempt < maxRetries) {
        attempt++;
        try {
            const response = await fetchWithTimeout(url);
            const text = await response.text();

            // XML 응답에서 에러 메시지 확인
            if (
                text.includes("SERVICE_ERROR") ||
                text.includes("SERVICE_ACCESS_DENIED_ERROR")
            ) {
                throw new Error("서비스 접근 오류");
            }

            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status}`);
            }

            return { ok: true, text };
        } catch (error) {
            lastError = error;

            // 마지막 시도가 아니면 재시도
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }

            // 마지막 시도에서도 실패한 경우
            return {
                ok: false,
                error: lastError.message,
                text: null,
            };
        }
    }
};

// 특정 연도의 공휴일 데이터를 가져오는 함수
export const fetchHolidays = async (year, month = null) => {
    try {
        const url = new URL(`${BASE_URL}/getRestDeInfo`);
        url.searchParams.append("serviceKey", API_KEY);
        url.searchParams.append("solYear", year);
        if (month) {
            url.searchParams.append(
                "solMonth",
                month.toString().padStart(2, "0")
            );
        }

        const { ok, text, error } = await fetchWithRetry(url);

        if (!ok) {
            throw new Error(error);
        }

        // XML 응답을 파싱
        const holidays = parseHolidayResponse(text);
        return holidays;
    } catch (error) {
        console.error("공휴일 데이터 조회 실패:", error.message);
        return {};
    }
};

// 캐시된 공휴일 데이터를 저장할 객체
const holidayCache = {};
// 로딩 중인 요청을 추적하는 객체
const loadingRequests = {};

// 공휴일 데이터를 가져오는 메인 함수 (캐시 활용)
export const getHolidaysForYear = async year => {
    const cacheKey = `${year}`;

    // 캐시된 데이터가 있으면 즉시 반환
    if (holidayCache[cacheKey]) {
        return holidayCache[cacheKey];
    }

    // 이미 로딩 중인 요청이 있으면 해당 요청의 결과를 기다림
    if (loadingRequests[cacheKey]) {
        return loadingRequests[cacheKey];
    }

    // 새로운 로딩 요청 생성
    loadingRequests[cacheKey] = (async () => {
        try {
            const holidays = {};
            const monthPromises = [];

            // 12개월 데이터를 병렬로 요청 (한 번에 3개씩만 요청)
            for (let i = 0; i < 12; i += 3) {
                const batchPromises = [];
                for (let j = 0; j < 3 && i + j < 12; j++) {
                    const month = i + j + 1;
                    batchPromises.push(
                        fetchHolidays(year, month)
                            .then(monthHolidays => {
                                Object.assign(holidays, monthHolidays);
                            })
                            .catch(() => {
                                // 개별 월 조회 실패는 무시
                            })
                    );
                }
                // 각 배치의 요청이 완료될 때까지 대기
                await Promise.all(batchPromises);
            }

            // 캐시에 저장
            holidayCache[cacheKey] = holidays;
            return holidays;
        } finally {
            // 로딩 완료 후 요청 추적 객체에서 제거
            delete loadingRequests[cacheKey];
        }
    })();

    return loadingRequests[cacheKey];
};

// 현재 날짜의 공휴일 정보를 가져오는 함수
export const getHolidayForDate = async date => {
    const year = getYear(date);
    const monthDay = format(date, "MMdd");

    // 캐시된 데이터가 있으면 즉시 반환
    const cacheKey = `${year}`;
    if (holidayCache[cacheKey]) {
        return holidayCache[cacheKey][monthDay] || null;
    }

    // 캐시된 데이터가 없으면 연도 데이터를 가져옴
    const holidays = await getHolidaysForYear(year);
    return holidays[monthDay] || null;
};

// 캐시 초기화 함수 (필요한 경우에만 사용)
export const clearHolidayCache = () => {
    Object.keys(holidayCache).forEach(key => delete holidayCache[key]);
    Object.keys(loadingRequests).forEach(key => delete loadingRequests[key]);
};
