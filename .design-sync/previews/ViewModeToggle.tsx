import { ViewModeToggle } from 'ankr-design-system';
import { useState } from 'react';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const CalendarMode = () => (
  <Pair>
    <ViewModeToggle viewMode="calendar" onViewModeChange={() => {}} />
  </Pair>
);

export const ListMode = () => (
  <Pair>
    <ViewModeToggle viewMode="list" onViewModeChange={() => {}} />
  </Pair>
);

export const Interactive = () => {
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
        <ViewModeToggle viewMode={mode} onViewModeChange={setMode} />
        <div className="mt-3 text-xs text-gray-500">{mode === 'calendar' ? '📅 캘린더' : '📋 목록'}</div>
      </div>
      <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>
        <ViewModeToggle viewMode={mode} onViewModeChange={setMode} />
        <div className="mt-3 text-xs text-gray-500">{mode === 'calendar' ? '📅 캘린더' : '📋 목록'}</div>
      </div>
    </div>
  );
};
