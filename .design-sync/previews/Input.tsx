import { Input } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const Default = () => (
  <Pair>
    <Input label="이벤트 이름" placeholder="행사 이름을 입력하세요" />
  </Pair>
);

export const WithError = () => (
  <Pair>
    <Input
      label="장소"
      placeholder="장소를 입력하세요"
      value="천시장"
      error="유효한 장소명을 입력해주세요"
    />
  </Pair>
);

export const States = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="일반" placeholder="입력하세요" />
      <Input label="필수 입력" placeholder="입력하세요" required />
      <Input label="비활성화" placeholder="편집 불가" disabled />
    </div>
  </Pair>
);

export const Types = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="날짜" type="date" />
      <Input label="시간" type="time" />
      <Input label="URL" type="url" placeholder="https://example.com" />
    </div>
  </Pair>
);
