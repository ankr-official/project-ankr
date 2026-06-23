import { ThemeToggle } from 'ankr-design-system';
import { useState } from 'react';

export const Light = () => (
  <div style={{ padding: 16 }}>
    <ThemeToggle isDark={false} onToggle={() => {}} />
  </div>
);

export const Dark = () => (
  <div style={{ padding: 16, background: '#111827', borderRadius: 8 }}>
    <ThemeToggle isDark={true} onToggle={() => {}} />
  </div>
);

export const Interactive = () => {
  const [isDark, setIsDark] = useState(false);
  return (
    <div
      style={{
        padding: 24,
        background: isDark ? '#111827' : '#ffffff',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'background 0.3s',
      }}
    >
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      <span style={{ fontSize: 14, color: isDark ? '#d1d5db' : '#374151' }}>
        {isDark ? '다크 모드' : '라이트 모드'}
      </span>
    </div>
  );
};
