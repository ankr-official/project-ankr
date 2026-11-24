import { useState } from "react";

export const ImageWithSkeleton = ({
  src,
  alt,
  wrapperClassName = "",
  imgClassName = "",
  loading = "lazy",
  fallbackSrc, // src 로드 실패 시 대체 (예: 썸네일 없음 → 원본)
}) => {
  const [loaded, setLoaded] = useState(false);
  // 실패한 src를 기억 — src prop이 바뀌면 자동으로 다시 src부터 시도
  const [failedSrc, setFailedSrc] = useState(null);
  const shownSrc = fallbackSrc && failedSrc === src ? fallbackSrc : src;
  const done = () => setLoaded(true);

  const handleError = () => {
    if (fallbackSrc && fallbackSrc !== src && failedSrc !== src) {
      setFailedSrc(src);
      return;
    }
    done();
  };

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
      )}
      <img
        src={shownSrc}
        alt={alt}
        loading={loading}
        referrerPolicy={shownSrc?.includes("pbs.twimg.com") ? "no-referrer" : undefined}
        className={`${imgClassName} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={done}
        onError={handleError}
      />
    </div>
  );
};
