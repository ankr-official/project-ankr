<div align="center">

<img src="public/favicon.svg" width="72" alt="ANKR 로고" />

# ANKR.KR

**한국 서브컬처 DJ 이벤트 데이터베이스**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-brightgreen?logo=github)](https://ankr.kr)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[🌐 서비스 바로가기](https://ankr.kr)

</div>

---

## 제작 취지

서브컬처 기반의 클럽 이벤트·DJ 파티는 코로나 규제 완화 이후 활발히 열리고 있지만, 관련 정보는 SNS에 흩어져 있거나 일부 커뮤니티에서만 공유되는 경우가 많습니다. SNS 알고리즘의 한계로 좋은 이벤트가 제대로 알려지지 못하고, 관심 있는 사람조차 원하는 정보를 제때 찾기 어려운 상황입니다.

**ANKR.KR**은 그런 문제를 해소하고자 시작했습니다. 서브컬처 기반 DJ 이벤트에 특화하여 장르·지역·날짜별로 정보를 한곳에 모으고, 누구나 이벤트를 제보하거나 정보를 보완할 수 있는 열린 플랫폼을 지향합니다.

---

## 주요 기능

| 기능              | 설명                                  |
| ----------------- | ------------------------------------- |
| 📅 이벤트 목록    | 예정 / 지난 이벤트를 제공             |
| 🎵 장르 필터      | 원곡·리믹스 등 장르별 필터링          |
| 🔍 통합 검색      | 이벤트명·장소·장르 키워드 검색        |
| 🗓️ 캘린더 뷰      | 월별 달력으로 이벤트 일정 확인        |
| 📋 테이블 뷰      | 목록형 테이블로 이벤트 상세 정보 확인 |
| 📣 이벤트 제보    | 신규 이벤트 제보 가능                 |
| ✏️ 정보 수정 요청 | 잘못된 정보에 대한 수정·삭제 요청     |
| 🌙 다크 모드      | 라이트/다크 테마 전환 지원            |
| 🔐 관리자 패널    | 제보·수정 요청 검토 및 이벤트 관리    |

---

## Tech Stack

```
Frontend   React 19 + Vite 6 + TailwindCSS 4
Database   Firebase Realtime Database (data_v2)
Auth       Firebase Authentication (커스텀 클레임 기반 관리자 권한)
Functions  Firebase Cloud Functions v2 (이메일 알림)
Hosting    GitHub Pages
```

**주요 라이브러리**

- `framer-motion` — 모달·카드 애니메이션
- `date-fns` — 날짜 포맷 처리
- `react-toastify` — 알림 토스트
- `@heroicons/react` — 아이콘

---

## 프로젝트 구조

```
src/
├── components/
│   ├── admin/          # 관리자 전용 컴포넌트
│   ├── events/         # 이벤트 목록·카드·테이블 컴포넌트
│   ├── form/           # 공용 폼 컴포넌트
│   └── ui/             # 공용 UI 컴포넌트
├── contexts/           # AuthContext
├── hooks/              # 커스텀 훅
├── pages/              # 페이지 컴포넌트
├── utils/              # 유틸리티 함수
└── constants/          # 장르 색상 등 전역 상수
```

---

## 목표

- 서브컬처 기반 DJ 이벤트 정보 접근성 향상
- 마이너한 로컬 파티 알리기
- 사용자 중심의 자율적 정보 공유 문화 확산

---

## Contacts

- 📧 Email: [ankr.web.official@gmail.com](mailto:ankr.web.official@gmail.com)
- 🧵 X(Twitter): [@ankr_db](https://x.com/ankr_db)
- 📸 Instagram: [@ankr.db.official](https://www.instagram.com/ankr.db.official)
