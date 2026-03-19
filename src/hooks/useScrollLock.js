import { useEffect } from "react";

/**
 * 모달이 열릴 때 배경 스크롤을 잠급니다.
 * - iOS Safari 대응: position:fixed + top: var(--scroll-y) (index.css의 body.modal-open 규칙)
 * - 스크롤바 폭 보정으로 레이아웃 흔들림 방지
 * - 닫힐 때 원래 스크롤 위치로 복원
 */
export const useScrollLock = (isActive) => {
  useEffect(() => {
    if (!isActive) return;

    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.dataset.scrollY = scrollY;
    document.body.style.setProperty("--scroll-y", `-${scrollY}px`);
    document.body.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    document.body.classList.add("modal-open");

    return () => {
      const saved = parseInt(document.body.dataset.scrollY || "0", 10);
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("--scroll-y");
      document.body.style.removeProperty("--scrollbar-width");
      window.scrollTo(0, saved);
    };
  }, [isActive]);
};
