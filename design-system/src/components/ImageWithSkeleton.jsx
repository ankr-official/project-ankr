import { useState } from 'react';

/**
 * 이미지 로드 중 애니메이션 스켈레톤 플레이스홀더를 표시하는 이미지 컴포넌트.
 *
 * @param {{ src: string, alt?: string, wrapperClassName?: string, imgClassName?: string, loading?: 'lazy'|'eager' }} props
 */
export function ImageWithSkeleton({
  src,
  alt = '',
  wrapperClassName = '',
  imgClassName = '',
  loading = 'lazy',
}) {
  const [loaded, setLoaded] = useState(false);
  const done = () => setLoaded(true);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-600" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`${imgClassName} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={done}
        onError={done}
      />
    </div>
  );
}
