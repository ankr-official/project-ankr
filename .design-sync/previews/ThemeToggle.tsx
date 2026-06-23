import { ThemeToggle } from 'ankr-design-system';
import { useState } from 'react';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const LightTheme = () => (
  <Pair>
    <ThemeToggle isDark={false} onToggle={() => {}} />
  </Pair>
);

export const DarkTheme = () => (
  <Pair>
    <ThemeToggle isDark={true} onToggle={() => {}} />
  </Pair>
);

export const Interactive = () => {
  const [isDark, setIsDark] = useState(false);
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <span className="text-sm text-gray-600">{isDark ? '다크 모드' : '라이트 모드'}</span>
      </div>
      <div className="dark" style={{ flex: 1, padding: 16, background: '#111827', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <span className="text-sm text-gray-400">{isDark ? '다크 모드' : '라이트 모드'}</span>
      </div>
    </div>
  );
};
