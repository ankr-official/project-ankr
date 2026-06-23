import { Card } from 'ankr-design-system';

export const Default = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Card title="이벤트 정보" subtitle="2026년 6월 행사 목록">
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
        서브컬쳐 DJ 이벤트 상세 정보를 여기에 표시합니다.
      </p>
    </Card>
  </div>
);

export const Padding = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
    <Card padding="sm" title="Small padding">
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>컴팩트한 카드</p>
    </Card>
    <Card padding="lg" title="Large padding">
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>여유있는 카드</p>
    </Card>
  </div>
);

export const ContentOnly = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Card>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
        <strong>ANKR.KR</strong>은 한국 서브컬쳐 DJ 이벤트 캘린더입니다.
        다가오는 행사를 한 눈에 확인하세요.
      </div>
    </Card>
  </div>
);
