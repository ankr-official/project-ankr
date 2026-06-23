import { Badge } from 'ankr-design-system';

export const Colors = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
    <Badge label="인디고" color="indigo" />
    <Badge label="블루" color="blue" />
    <Badge label="그린" color="green" />
    <Badge label="레드" color="red" />
    <Badge label="옐로우" color="yellow" />
    <Badge label="핑크" color="pink" />
    <Badge label="퍼플" color="purple" />
    <Badge label="오렌지" color="orange" />
    <Badge label="그레이" color="gray" />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16 }}>
    <Badge label="Small" color="indigo" size="sm" />
    <Badge label="Medium" color="indigo" size="md" />
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    <Badge label="인디고" color="indigo" />
    <Badge label="블루" color="blue" />
    <Badge label="그린" color="green" />
    <Badge label="레드" color="red" />
    <Badge label="옐로우" color="yellow" />
    <Badge label="핑크" color="pink" />
    <Badge label="퍼플" color="purple" />
    <Badge label="오렌지" color="orange" />
    <Badge label="그레이" color="gray" />
  </div>
);

export const InContext = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 14, color: '#374151' }}>상태:</span>
      <Badge label="진행 중" color="green" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 14, color: '#374151' }}>카테고리:</span>
      <Badge label="이벤트" color="indigo" />
      <Badge label="음악" color="purple" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 14, color: '#374151' }}>상태:</span>
      <Badge label="종료" color="gray" />
    </div>
  </div>
);
