# ANKR.KR Design System — Usage Conventions

## Setup: No provider required

Components work standalone. No wrapping provider or context is needed. Just import and render:

```jsx
import { Button, Card, EventCard } from 'ankr-design-system';
// or from the bundle: window.AnkrDS.Button, window.AnkrDS.Card, etc.

function MyView() {
  return (
    <Card title="이벤트 정보">
      <EventCard
        eventName="CLUB DIMENSION Vol.14"
        schedule="2026-07-15T00:00:00.000Z"
        location="홍대 클럽 FF"
        genre="원곡, 리믹스"
      />
    </Card>
  );
}
```

## Dark mode

Dark mode is **class-based** — add `dark` to `<html>` or the root wrapper. All components include `dark:` Tailwind classes that activate automatically:

```html
<html class="dark">   <!-- dark mode ON -->
<html>                <!-- light mode (default) -->
```

Do not manually pass dark-mode props to components.

## Styling idiom: Tailwind utility classes

All components use **Tailwind CSS utility classes**. Apply layout glue and spacing with Tailwind directly on wrapper elements. Do NOT add custom CSS or inline styles when a Tailwind class exists.

Key class families in use:

| Purpose | Classes |
|---|---|
| Primary / accent | `bg-indigo-600`, `text-indigo-600`, `dark:text-indigo-400`, `border-indigo-600` |
| Surface backgrounds | `bg-white`, `dark:bg-gray-900` (page), `dark:bg-gray-800` (card/panel) |
| Border | `border-gray-200`, `dark:border-gray-700` |
| Text | `text-gray-900 dark:text-white` (primary), `text-gray-500 dark:text-gray-400` (secondary) |
| Radius | `rounded-lg` (buttons/inputs), `rounded-xl` (cards), `rounded-3xl` (modals mobile) |
| Hover (pointer devices only) | `mouse:hover:bg-gray-100 dark:mouse:hover:bg-gray-800` — use `mouse:` prefix, NOT plain `hover:` |
| Transitions | `transition-colors` on interactive elements |
| Focus | `focus:outline-none` (no browser ring — styles applied manually per component) |

**`mouse:` variant**: This is a custom Tailwind variant (`@media (hover: hover) and (pointer: fine)`) that applies hover only on mouse/trackpad, never on mobile touchscreens. Always use `mouse:hover:` instead of bare `hover:` for interactive states on layout glue you write.

## Component quick-reference

- **Button** — `variant`: `primary | secondary | ghost | danger`. `size`: `sm | md | lg`. Supports `loading`, `disabled`, `fullWidth`.
- **Input / Textarea** — Accepts `label`, `error` (shows red border + message), `required` (asterisk), `disabled`.
- **Badge** — Generic colored pill. `color`: `indigo | blue | green | red | yellow | pink | purple | cyan | orange | lime | gray`.
- **GenreBadge** — ANKR-specific genre pill. Pass comma-separated genre string: `genre="원곡, 리믹스"`.
- **Card** — Surface container. `padding`: `none | sm | md | lg`. Optional `title` and `subtitle`.
- **Modal** — Overlay: slides up from bottom on mobile, centered on desktop. Pass `isOpen` + `onClose`.
- **TabBar** — Pass `tabs: [{id, label}]`, `activeTab`, `onTabChange`.
- **TabButton** — Single tab. `isActive` + `onClick` + `children`.
- **ThemeToggle** — Controlled: `isDark: boolean` + `onToggle: () => void`.
- **ViewModeToggle** — `viewMode: 'calendar' | 'list'` + `onViewModeChange`.
- **EventCard** — `eventName`, `schedule` (ISO string), `location`, `genre` (optional), `imgUrl` (optional), `isPast` (optional).
- **ImageWithSkeleton** — Renders a gray animated skeleton while the image loads. Pass `wrapperClassName` for shape/size.
- **Spinner** — `size`: `sm | md | lg`. `color`: `indigo | white | gray`.

## Stylesheet location

The compiled CSS lives in `styles.css` (which `@import`s `_ds_bundle.css`). Tailwind's full utility set is included — use any Tailwind class in layout glue without additional stylesheet imports.
