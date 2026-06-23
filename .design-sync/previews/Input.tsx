import { Input } from 'ankr-design-system';

export const Default = () => (
  <div style={{ padding: 16, maxWidth: 320 }}>
    <Input label="이벤트 이름" placeholder="행사 이름을 입력하세요" />
  </div>
);

export const WithError = () => (
  <div style={{ padding: 16, maxWidth: 320 }}>
    <Input
      label="장소"
      placeholder="장소를 입력하세요"
      value="천시장"
      error="유효한 장소명을 입력해주세요"
    />
  </div>
);

export const States = () => (
  <div style={{ padding: 16, maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Input label="일반" placeholder="입력하세요" />
    <Input label="필수 입력" placeholder="입력하세요" required />
    <Input label="비활성화" placeholder="편집 불가" disabled />
  </div>
);

export const Types = () => (
  <div style={{ padding: 16, maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Input label="날짜" type="date" />
    <Input label="시간" type="time" />
    <Input label="URL" type="url" placeholder="https://example.com" />
  </div>
);
