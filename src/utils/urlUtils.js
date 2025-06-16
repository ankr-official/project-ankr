const LOCATION_URLS = {
    "을지로 H․ai":
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C%20146-1/address/14136925.4252946,4518328.7316046,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C%20146-1?c=15.06,0,0,0,dh",
    "합정 아소비스테이션":
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C%208%EA%B8%B8%2016-22/address/14128137.2301702,4515967.6851904,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C8%EA%B8%B8%2016-22,new?c=19.85,0,0,0,dh&isCorrectAnswer=true",
    "대전 SC아트홀":
        "https://map.naver.com/p/entry/address/14184749.1579633,4345592.5908594,%EB%8C%80%EC%A0%84%20%EC%A4%91%EA%B5%AC%20%EB%B3%B4%EB%AC%B8%EB%A1%9C260%EB%B2%88%EA%B8%B8%2030?c=15.00,0,0,0,dh",
    "안암 블루라움":
        "https://map.naver.com/p/search/%EC%95%88%EC%95%94%20%EB%B8%94%EB%A3%A8%EB%9D%BC%EC%9B%80/place/804212537?c=15.00,0,0,0,dh&placePath=%3Fentry%253Dbmp",
    "학여울 SETEC":
        "https://map.naver.com/p/entry/place/11639873?placePath=%2Fhome",
    "신림 시공간":
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EA%B4%80%EC%95%85%EA%B5%AC%20%EA%B4%80%EC%B2%9C%EB%A1%9C%2025/address/14129552.2122177,4506514.6240075,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B4%80%EC%95%85%EA%B5%AC%20%EA%B4%80%EC%B2%9C%EB%A1%9C%2025,new?c=14135850.9361736%2C4517208.0819429%2C17.54%2C0%2C0%2C0%2Cdh&isCorrectAnswer=true",
    "홍대 프리버드":
        "https://map.naver.com/p/entry/address/14128816.8022657,4515962.2373566,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%99%80%EC%9A%B0%EC%82%B0%EB%A1%9C17%EA%B8%B8%2019-22?c=16.17,0,0,0,dh",
};

export const getNaverMapUrl = location => {
    return (
        LOCATION_URLS[location] ||
        `https://map.naver.com/p/search/${encodeURIComponent(location)}`
    );
};
