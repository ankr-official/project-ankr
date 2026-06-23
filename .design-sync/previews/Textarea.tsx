import { Textarea } from 'ankr-design-system';

export const Default = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Textarea label="기타 정보" placeholder="이벤트에 대한 추가 정보를 입력하세요" />
  </div>
);

export const States = () => (
  <div style={{ padding: 16, maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Textarea label="일반" placeholder="내용 입력" rows={3} />
    <Textarea label="필수 입력" placeholder="내용 입력" required rows={3} />
    <Textarea label="비활성화" placeholder="편집 불가" disabled rows={3} />
  </div>
);

export const WithError = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Textarea
      label="수정 요청 사유"
      value="ㅁ"
      error="최소 10자 이상 입력해주세요"
      rows={3}
    />
  </div>
);
