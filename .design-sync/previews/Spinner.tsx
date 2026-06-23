import { Spinner } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 20, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 20, background: '#111827' }}>{children}</div>
  </div>
);

export const Sizes = () => (
  <Pair>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner size="sm" color="indigo" />
        <span className="text-xs text-gray-400 dark:text-gray-500">sm</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner size="md" color="indigo" />
        <span className="text-xs text-gray-400 dark:text-gray-500">md</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner size="lg" color="indigo" />
        <span className="text-xs text-gray-400 dark:text-gray-500">lg</span>
      </div>
    </div>
  </Pair>
);

export const Colors = () => (
  <Pair>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner size="md" color="indigo" />
        <span className="text-xs text-gray-400 dark:text-gray-500">indigo</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#4f46e5', padding: '10px 12px', borderRadius: 8 }}>
        <Spinner size="md" color="white" />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>white</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Spinner size="md" color="gray" />
        <span className="text-xs text-gray-400 dark:text-gray-500">gray</span>
      </div>
    </div>
  </Pair>
);

export const InButton = () => (
  <Pair>
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'not-allowed', opacity: 0.8 }}>
      <Spinner size="sm" color="white" />
      저장 중...
    </button>
  </Pair>
);
