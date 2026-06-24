# ANKR.KR Design System — 사용 규칙

## 설정: Provider 불필요

컴포넌트는 독립적으로 동작합니다. Provider나 Context 래핑 없이 바로 사용하세요:

```jsx
import { Button, EventCard } from 'ankr-design-system';

function MyView() {
  return (
    <div className="p-4">
      <EventCard
        eventName="CLUB DIMENSION Vol.14"
        schedule="2026-07-15T00:00:00.000Z"
        location="홍대 클럽 FF"
        genre="원곡, 리믹스"
      />
      <Button variant="primary" className="mt-4">자세히 보기</Button>
    </div>
  );
}
```

## 다크 모드

다크 모드는 **클래스 기반**입니다 — `<html>` 또는 최상위 래퍼에 `dark`를 추가하세요. 모든 컴포넌트에 `dark:` Tailwind 클래스가 포함되어 자동으로 적용됩니다:

```html
<html class="dark">   <!-- 다크 모드 ON -->
<html>                <!-- 라이트 모드 (기본값) -->
```

컴포넌트에 다크 모드 prop을 직접 전달하지 마세요.

## 스타일 방식: Tailwind 유틸리티 클래스

모든 컴포넌트는 **Tailwind CSS 유틸리티 클래스**를 사용합니다. 레이아웃 연결과 간격 조정은 래퍼 요소에 Tailwind를 직접 적용하세요. Tailwind 클래스로 대체 가능한 경우 커스텀 CSS나 인라인 스타일을 사용하지 마세요.

주요 클래스:

| 용도 | 클래스 |
|---|---|
| 주색 / 강조색 | `bg-indigo-600`, `text-indigo-600`, `dark:text-indigo-400`, `border-indigo-600` |
| 표면 배경 | `bg-white`, `dark:bg-gray-900` (페이지), `dark:bg-gray-800` (카드/패널) |
| 테두리 | `border-gray-200`, `dark:border-gray-700` |
| 텍스트 | `text-gray-900 dark:text-white` (주 텍스트), `text-gray-500 dark:text-gray-400` (보조 텍스트) |
| 모서리 | `rounded-lg` (버튼/입력), `rounded-xl` (카드), `rounded-3xl` (모바일 모달) |
| 호버 (포인터 기기 전용) | `mouse:hover:bg-gray-100 dark:mouse:hover:bg-gray-800` — `mouse:` 접두사 사용, 일반 `hover:` 사용 금지 |
| 전환 | 인터랙티브 요소에 `transition-colors` |
| 포커스 | `focus:outline-none` (브라우저 링 없음 — 컴포넌트별 수동 스타일 적용) |

**`mouse:` 변형**: 커스텀 Tailwind 변형(`@media (hover: hover) and (pointer: fine)`)으로, 마우스/트랙패드에서만 호버를 적용하며 모바일 터치스크린에서는 동작하지 않습니다. 레이아웃 연결 코드에서 인터랙티브 상태에는 항상 `mouse:hover:`를 사용하고 일반 `hover:`는 사용하지 마세요.

## 컴포넌트 빠른 참조

- **Button** — `variant`: `primary | secondary | ghost | danger`. `size`: `sm | md | lg`. `loading`, `disabled`, `fullWidth` 지원.
- **Input / Textarea** — `label`, `error` (빨간 테두리 + 메시지), `required` (별표), `disabled` 지원.
- **GenreBadge** — ANKR 전용 장르 pill. 쉼표로 구분된 장르 문자열 전달: `genre="원곡, 리믹스"`.
- **Modal** — 오버레이: 모바일에서는 하단에서 슬라이드 업, 데스크탑에서는 중앙 정렬. `isOpen` + `onClose` 전달.
- **TabBar** — `tabs: [{key, label}]`, `active`, `onChange` 전달.
- **TabButton** — 단독 탭. `isActive` + `onClick` + `children`.
- **ThemeToggle** — 제어 컴포넌트: `isDark: boolean` + `onToggle: () => void`.
- **ViewModeToggle** — `viewMode: 'calendar' | 'list'` + `onViewModeChange`.
- **EventCard** — `eventName`, `schedule` (ISO 문자열), `location`, `genre` (선택), `imgUrl` (선택), `isPast` (선택).
- **ImageWithSkeleton** — 이미지 로드 중 회색 애니메이션 스켈레톤 표시. 모양/크기는 `wrapperClassName`으로 지정.
- **Spinner** — `size`: `sm | md | lg`. `color`: `indigo | white | gray`.

## 스타일시트 위치

컴파일된 CSS는 `styles.css`에 있습니다 (`_ds_bundle.css`를 `@import`). Tailwind 전체 유틸리티 세트가 포함되어 있어 — 추가 스타일시트 임포트 없이 레이아웃 연결에 Tailwind 클래스를 자유롭게 사용할 수 있습니다.
