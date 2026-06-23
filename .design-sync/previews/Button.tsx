import { Button } from 'ankr-design-system';

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16 }}>
    <Button variant="primary">저장하기</Button>
    <Button variant="secondary">취소</Button>
    <Button variant="ghost">더 보기</Button>
    <Button variant="danger">삭제</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16 }}>
    <Button variant="primary" size="sm">소형</Button>
    <Button variant="primary" size="md">중형</Button>
    <Button variant="primary" size="lg">대형</Button>
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16 }}>
    <Button variant="primary" loading>저장 중...</Button>
    <Button variant="primary" disabled>비활성화</Button>
    <Button variant="secondary" disabled>비활성화</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ padding: 16, maxWidth: 320 }}>
    <Button variant="primary" fullWidth>Google Calendar에 추가</Button>
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
    <Button variant="primary">저장하기</Button>
    <Button variant="secondary">취소</Button>
    <Button variant="ghost">더 보기</Button>
    <Button variant="danger">삭제</Button>
    <Button variant="primary" loading>저장 중...</Button>
    <Button variant="primary" disabled>비활성화</Button>
  </div>
);
