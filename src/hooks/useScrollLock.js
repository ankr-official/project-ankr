import { useLayoutEffect } from "react";

export const useScrollLock = (isActive) => {
  useLayoutEffect(() => {
    if (!isActive) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("--scrollbar-width");
    };
  }, [isActive]);
};
