import { EventCard } from 'ankr-design-system';

export const Default = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <EventCard
      eventName="CLUB DIMENSION Vol.14 — 여름 특별 에디션"
      schedule="2026-07-15T00:00:00.000Z"
      location="홍대 클럽 FF"
      genre="원곡, 리믹스"
      imgUrl="https://picsum.photos/360/200"
    />
  </div>
);

export const WithoutImage = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <EventCard
      eventName="VOCALOID NIGHT FEST 2026"
      schedule="2026-08-20T00:00:00.000Z"
      location="홍대 클럽 빵"
      genre="보컬로이드, 동인음악"
    />
  </div>
);

export const PastEvent = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <EventCard
      eventName="랜덤플레이댄스 @ 신촌"
      schedule="2026-03-10T00:00:00.000Z"
      location="신촌 연세로"
      genre="랜플댄"
      isPast={true}
      viewCount={1243}
    />
  </div>
);

export const Grid = () => (
  <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 720 }}>
    <EventCard
      eventName="DJ NIGHT — 전자음악 페스티벌"
      schedule="2026-07-20T00:00:00.000Z"
      location="이태원 클럽 CAKESHOP"
      genre="전자음악"
    />
    <EventCard
      eventName="리듬게임 이벤트 파티"
      schedule="2026-07-28T00:00:00.000Z"
      location="건대 클럽 NB2"
      genre="리듬게임, Any Song (복합)"
    />
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 720 }}>
    <EventCard
      eventName="CLUB DIMENSION Vol.14"
      schedule="2026-07-15T00:00:00.000Z"
      location="홍대 클럽 FF"
      genre="원곡, 리믹스"
      imgUrl="https://picsum.photos/360/200"
    />
    <EventCard
      eventName="랜덤플레이댄스 @ 신촌"
      schedule="2026-03-10T00:00:00.000Z"
      location="신촌 연세로"
      genre="랜플댄"
      isPast={true}
      viewCount={1243}
    />
  </div>
);
