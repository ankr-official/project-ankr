const LOCATION_URLS = {
    "을지로 H․ai":
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C%20146-1/address/14136925.4252946,4518328.7316046,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C%20146-1?c=15.06,0,0,0,dh",
    "합정 아소비스테이션":
        "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C%208%EA%B8%B8%2016-22/address/14128137.2301702,4515967.6851904,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C8%EA%B8%B8%2016-22,new?c=19.85,0,0,0,dh&isCorrectAnswer=true",
    "대전 SC아트홀":
        "https://map.naver.com/p/entry/address/14184749.1579633,4345592.5908594,%EB%8C%80%EC%A0%84%20%EC%A4%91%EA%B5%AC%20%EB%B3%B4%EB%AC%B8%EB%A1%9C260%EB%B2%88%EA%B8%B8%2030?c=15.00,0,0,0,dh",
    "안암 블루라움":
        "https://map.naver.com/p/search/%EC%95%88%EC%95%94%20%EB%B8%94%EB%A3%A8%EB%9D%BC%EC%9B%80/place/804212537?c=15.00,0,0,0,dh&placePath=%3Fentry%253Dbmp",
};

export const getNaverMapUrl = location => {
    return (
        LOCATION_URLS[location] ||
        `https://map.naver.com/p/search/${encodeURIComponent(location)}`
    );
};
