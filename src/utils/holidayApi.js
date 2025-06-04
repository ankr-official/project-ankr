const API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY;
const BASE_URL =
    "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService";

// 공휴일 정보 조회
export const getHolidayInfo = async (year, month) => {
    try {
        const url = `${BASE_URL}/getHoliDeInfo`;
        const params = new URLSearchParams({
            serviceKey: API_KEY,
            solYear: year,
            solMonth: month.toString().padStart(2, "0"),
            _type: "json",
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.response?.header?.resultCode === "00") {
            const items = data.response.body.items.item;
            // 단일 항목인 경우 배열로 변환
            const holidays = Array.isArray(items) ? items : [items];

            return holidays.reduce((acc, holiday) => {
                const date = holiday.locdate.toString();
                acc[date.slice(4, 8)] = holiday.dateName;
                return acc;
            }, {});
        }

        return {};
    } catch (error) {
        console.error("공휴일 정보 조회 실패:", error);
        return {};
    }
};

// 기념일 정보 조회
export const getAnniversaryInfo = async (year, month) => {
    try {
        const url = `${BASE_URL}/getAnniversaryInfo`;
        const params = new URLSearchParams({
            serviceKey: API_KEY,
            solYear: year,
            solMonth: month.toString().padStart(2, "0"),
            _type: "json",
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.response?.header?.resultCode === "00") {
            const items = data.response.body.items.item;
            // 단일 항목인 경우 배열로 변환
            const anniversaries = Array.isArray(items) ? items : [items];

            return anniversaries.reduce((acc, anniversary) => {
                const date = anniversary.locdate.toString();
                acc[date.slice(4, 8)] = anniversary.dateName;
                return acc;
            }, {});
        }

        return {};
    } catch (error) {
        console.error("기념일 정보 조회 실패:", error);
        return {};
    }
};
