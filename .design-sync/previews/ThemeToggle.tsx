import { ThemeToggle } from 'ankr-design-system';
import { useState } from 'react';

export const Default = () => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
      <ThemeToggle isDark={false} onToggle={() => {}} />
      <span style={{ fontSize: 12, color: '#6b7280' }}>라이트 모드</span>
    </div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
      <ThemeToggle isDark={true} onToggle={() => {}} />
      <span style={{ fontSize: 12, color: '#9ca3af' }}>다크 모드</span>
    </div>
  </div>
);

export const Interactive = () => {
  const [isDark, setIsDark] = useState(false);
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <span style={{ fontSize: 12, color: '#6b7280' }}>{isDark ? '다크 모드' : '라이트 모드'}</span>
      </div>
      <div className="dark" style={{ flex: 1, padding: 16, background: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{isDark ? '다크 모드' : '라이트 모드'}</span>
      </div>
    </div>
  );
};
