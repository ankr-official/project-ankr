import { TabBar } from 'ankr-design-system';
import { useState } from 'react';

export const AdminTabs = () => {
  const [active, setActive] = useState('events');
  return (
    <div style={{ padding: 16 }}>
      <TabBar
        tabs={[
          { key: 'events', label: '이벤트 관리', count: 12 },
          { key: 'users', label: '사용자 관리', count: 34 },
          { key: 'reports', label: '신고 내역', count: 3 },
          { key: 'edits', label: '수정 요청', count: 7 },
        ]}
        active={active}
        onChange={setActive}
      />
    </div>
  );
};

export const WithCount = () => {
  const [active, setActive] = useState('all');
  return (
    <div style={{ padding: 16 }}>
      <TabBar
        tabs={[
          { key: 'all', label: '전체', count: 56 },
          { key: 'pending', label: '대기 중', count: 4 },
          { key: 'done', label: '완료' },
        ]}
        active={active}
        onChange={setActive}
      />
    </div>
  );
};

export const DarkMode = () => {
  const [active, setActive] = useState('events');
  return (
    <div className="dark" style={{ background: '#111827', padding: 16 }}>
      <TabBar
        tabs={[
          { key: 'events', label: '이벤트 관리', count: 12 },
          { key: 'users', label: '사용자 관리', count: 34 },
          { key: 'reports', label: '신고 내역', count: 3 },
          { key: 'edits', label: '수정 요청', count: 7 },
        ]}
        active={active}
        onChange={setActive}
      />
    </div>
  );
};
