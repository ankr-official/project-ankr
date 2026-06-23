import { Textarea } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const Default = () => (
  <Pair>
    <Textarea label="기타 정보" placeholder="이벤트에 대한 추가 정보를 입력하세요" />
  </Pair>
);

export const States = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Textarea label="일반" placeholder="내용 입력" rows={3} />
      <Textarea label="필수 입력" placeholder="내용 입력" required rows={3} />
      <Textarea label="비활성화" placeholder="편집 불가" disabled rows={3} />
    </div>
  </Pair>
);

export const WithError = () => (
  <Pair>
    <Textarea
      label="수정 요청 사유"
      value="ㅁ"
      error="최소 10자 이상 입력해주세요"
      rows={3}
    />
  </Pair>
);
