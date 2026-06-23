import { ImageWithSkeleton } from 'ankr-design-system';

export const Loaded = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <ImageWithSkeleton
      src="https://picsum.photos/360/200"
      alt="이벤트 배너 이미지"
      wrapperClassName="rounded-lg overflow-hidden"
      imgClassName="w-full h-48 object-cover"
    />
  </div>
);

export const Loading = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <div style={{ position: 'relative', width: '100%', height: 192, borderRadius: 8, overflow: 'hidden', background: '#d1d5db', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>로딩 중 (스켈레톤 placeholder)</p>
  </div>
);

export const AvatarShape = () => (
  <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
    <ImageWithSkeleton
      src="https://picsum.photos/80/80"
      alt="아바타"
      wrapperClassName="rounded-full overflow-hidden"
      imgClassName="w-20 h-20 object-cover"
    />
    <div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>이벤트 주최자</div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>ANKR.KR 공식</div>
    </div>
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16, maxWidth: 360 }}>
    <ImageWithSkeleton
      src="https://picsum.photos/360/200"
      alt="이벤트 배너"
      wrapperClassName="rounded-lg overflow-hidden"
      imgClassName="w-full h-48 object-cover"
    />
  </div>
);
