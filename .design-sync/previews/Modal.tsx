import { Button } from 'ankr-design-system';

// Modal uses fixed inset-0 — preview renders the open state inline
// to show the panel appearance without the backdrop overlay
const ModalPanel = ({ title, children, size = 'md' }: {
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const maxWidth = size === 'sm' ? 384 : size === 'md' ? 512 : 672;
  return (
    <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>
        {/* Mobile drag handle */}
        <div style={{ padding: '16px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 6, background: '#9ca3af', borderRadius: 999 }} />
        </div>
        <div style={{ padding: '16px 24px 24px' }}>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: 18 }}>×</div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export const Open = () => (
  <ModalPanel title="이벤트 상세 정보" size="md">
    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }}>
      2026년 7월 15일 홍대 클럽에서 열리는 서브컬쳐 DJ 이벤트입니다.
      원곡/리믹스 장르 위주의 세트리스트로 구성됩니다.
    </p>
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button variant="secondary" size="sm">닫기</Button>
      <Button variant="primary" size="sm">Google Calendar에 추가</Button>
    </div>
  </ModalPanel>
);

export const SmallModal = () => (
  <ModalPanel title="삭제 확인" size="sm">
    <p style={{ fontSize: 14, color: '#374151', margin: '0 0 16px' }}>
      이 이벤트를 삭제하면 복구할 수 없습니다. 계속하시겠습니까?
    </p>
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button variant="secondary" size="sm">취소</Button>
      <Button variant="danger" size="sm">삭제</Button>
    </div>
  </ModalPanel>
);

export const LargeModal = () => (
  <ModalPanel title="이벤트 목록" size="lg">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {['CLUB DIMENSION Vol.14', 'VOCALOID NIGHT FEST 2026', '랜덤플레이댄스 @ 신촌'].map((name, i) => (
        <div key={i} style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: 14, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{name}</span>
          <Button variant="ghost" size="sm">보기</Button>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="secondary" size="sm">닫기</Button>
    </div>
  </ModalPanel>
);
