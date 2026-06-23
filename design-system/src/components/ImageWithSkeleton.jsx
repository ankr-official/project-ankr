import { useState } from 'react';

/**
 * Image with animated skeleton placeholder shown while loading.
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
