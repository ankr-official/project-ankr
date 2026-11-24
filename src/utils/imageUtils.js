import { ASSETS_BASE_URL } from "../constants";

/**
 * 목록용 작은 이미지 URL
 * - R2(Worker) 이미지: 썸네일 `image(_N)_thumb.webp` (가로 400px) — 없으면 ImageWithSkeleton의 fallbackSrc로 원본 표시
 * - Twitter 이미지: `name=small`
 */
export const toThumbUrl = (url) => {
  if (!url) return url;
  if (url.startsWith(`${ASSETS_BASE_URL}/`)) {
    return url.replace(/\/(image(?:_\d+)?)\.\w+$/, "/$1_thumb.webp");
  }
  return url.replace(/(name=)[^&]*/, "$1small");
};
