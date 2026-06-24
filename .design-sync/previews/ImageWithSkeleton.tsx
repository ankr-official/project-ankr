import { ImageWithSkeleton } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const Loaded = () => (
  <Pair>
    <ImageWithSkeleton
      src="https://picsum.photos/400/200"
      alt="이벤트 배너 이미지"
      wrapperClassName="rounded-lg overflow-hidden"
      imgClassName="w-full h-36 object-cover"
    />
  </Pair>
);

export const Loading = () => (
  <Pair>
    <div className="w-full h-36 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
  </Pair>
);

export const AvatarShape = () => (
  <Pair>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ImageWithSkeleton
        src="https://picsum.photos/80/80"
        alt="아바타"
        wrapperClassName="rounded-full overflow-hidden flex-shrink-0"
        imgClassName="w-16 h-16 object-cover"
      />
      <div>
        <div className="font-semibold text-sm text-gray-900 dark:text-white">이벤트 주최자</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">ANKR.KR 공식</div>
      </div>
    </div>
  </Pair>
);
