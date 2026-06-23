import { TabButton } from 'ankr-design-system';

export const States = () => (
  <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 8px' }}>
    <TabButton isActive={true}>예정 행사</TabButton>
    <TabButton isActive={false}>지난 행사</TabButton>
    <TabButton isActive={false}>즐겨찾기</TabButton>
  </div>
);

export const MultipleActive = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
    <div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>첫 번째 탭 활성</div>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <TabButton isActive={true}>캘린더</TabButton>
        <TabButton isActive={false}>목록</TabButton>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>두 번째 탭 활성</div>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <TabButton isActive={false}>캘린더</TabButton>
        <TabButton isActive={true}>목록</TabButton>
      </div>
    </div>
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16 }}>
    <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
      <TabButton isActive={true}>예정 행사</TabButton>
      <TabButton isActive={false}>지난 행사</TabButton>
      <TabButton isActive={false}>즐겨찾기</TabButton>
    </div>
  </div>
);
