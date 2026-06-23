import { ViewModeToggle } from 'ankr-design-system';
import { useState } from 'react';

export const CalendarMode = () => (
  <div style={{ padding: 16 }}>
    <ViewModeToggle viewMode="calendar" onViewModeChange={() => {}} />
  </div>
);

export const ListMode = () => (
  <div style={{ padding: 16 }}>
    <ViewModeToggle viewMode="list" onViewModeChange={() => {}} />
  </div>
);

export const Interactive = () => {
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  return (
    <div style={{ padding: 16 }}>
      <ViewModeToggle viewMode={mode} onViewModeChange={setMode} />
      <div style={{ padding: '16px 0', fontSize: 14, color: '#6b7280' }}>
        현재 뷰: {mode === 'calendar' ? '📅 캘린더' : '📋 목록'}
      </div>
    </div>
  );
};
