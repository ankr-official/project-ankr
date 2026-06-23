import { Button } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const Variants = () => (
  <Pair>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button variant="primary">저장하기</Button>
      <Button variant="secondary">취소</Button>
      <Button variant="ghost">더 보기</Button>
      <Button variant="danger">삭제</Button>
    </div>
  </Pair>
);

export const Sizes = () => (
  <Pair>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button variant="primary" size="sm">소형</Button>
      <Button variant="primary" size="md">중형</Button>
      <Button variant="primary" size="lg">대형</Button>
    </div>
  </Pair>
);

export const States = () => (
  <Pair>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button variant="primary" loading>저장 중...</Button>
      <Button variant="primary" disabled>비활성화</Button>
      <Button variant="secondary" disabled>비활성화</Button>
    </div>
  </Pair>
);

export const FullWidth = () => (
  <Pair>
    <Button variant="primary" fullWidth>Google Calendar에 추가</Button>
  </Pair>
);
