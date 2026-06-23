import { TabBar } from 'ankr-design-system';
import { useState } from 'react';

export const Default = () => {
  const [active, setActive] = useState('upcoming');
  return (
    <div style={{ padding: 16 }}>
      <TabBar
        tabs={[
          { id: 'upcoming', label: '예정 행사' },
          { id: 'past', label: '지난 행사' },
          { id: 'favorites', label: '즐겨찾기' },
        ]}
        activeTab={active}
        onTabChange={setActive}
      />
      <div style={{ padding: '16px 0', fontSize: 14, color: '#6b7280' }}>
        현재 선택: {active === 'upcoming' ? '예정 행사' : active === 'past' ? '지난 행사' : '즐겨찾기'}
      </div>
    </div>
  );
};

export const AdminTabs = () => {
  const [active, setActive] = useState('events');
  return (
    <div style={{ padding: 16 }}>
      <TabBar
        tabs={[
          { id: 'events', label: '이벤트 관리' },
          { id: 'users', label: '사용자 관리' },
          { id: 'reports', label: '신고 내역' },
          { id: 'edits', label: '수정 요청' },
        ]}
        activeTab={active}
        onTabChange={setActive}
      />
    </div>
  );
};
