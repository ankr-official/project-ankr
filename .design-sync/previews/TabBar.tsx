import { TabBar } from 'ankr-design-system';
import { useState } from 'react';

export const AdminTabs = () => {
  const [active, setActive] = useState('events');
  const tabs = [
    { key: 'events', label: '이벤트 관리', count: 12 },
    { key: 'users', label: '사용자 관리', count: 34 },
    { key: 'reports', label: '신고 내역', count: 3 },
    { key: 'edits', label: '수정 요청', count: 7 },
  ];
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
        <TabBar tabs={tabs} active={active} onChange={setActive} />
      </div>
      <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>
        <TabBar tabs={tabs} active={active} onChange={setActive} />
      </div>
    </div>
  );
};

export const WithCount = () => {
  const [active, setActive] = useState('all');
  const tabs = [
    { key: 'all', label: '전체', count: 56 },
    { key: 'pending', label: '대기 중', count: 4 },
    { key: 'done', label: '완료' },
  ];
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
        <TabBar tabs={tabs} active={active} onChange={setActive} />
      </div>
      <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>
        <TabBar tabs={tabs} active={active} onChange={setActive} />
      </div>
    </div>
  );
};
