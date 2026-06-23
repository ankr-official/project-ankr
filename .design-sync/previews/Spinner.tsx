import { Spinner } from 'ankr-design-system';

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="sm" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>small</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="md" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>medium</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="lg" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>large</span>
    </div>
  </div>
);

export const Colors = () => (
  <div style={{ display: 'flex', gap: 16, padding: 24, alignItems: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="md" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>indigo</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#4f46e5', padding: 12, borderRadius: 8 }}>
      <Spinner size="md" color="white" />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>white</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="md" color="gray" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>gray</span>
    </div>
  </div>
);

export const InButton = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'not-allowed', opacity: 0.8 }}>
      <Spinner size="sm" color="white" />
      저장 중...
    </button>
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="sm" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>small</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="md" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>medium</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="lg" color="indigo" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>large</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Spinner size="md" color="gray" />
      <span style={{ fontSize: 11, color: '#9ca3af' }}>gray</span>
    </div>
  </div>
);
