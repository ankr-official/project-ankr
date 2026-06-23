import { EventCard } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 12, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 12, background: '#111827' }}>{children}</div>
  </div>
);

export const Default = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <EventCard
        eventName="CLUB DIMENSION Vol.14 — 여름 특별 에디션"
        schedule="2026-07-15T00:00:00.000Z"
        timeStart="2026-07-15T13:00:00.000Z"
        timeEnd="2026-07-15T20:00:00.000Z"
        location="홍대 클럽 FF"
        genre="원곡, 리믹스"
        imgUrl="https://picsum.photos/96/128"
      />
      <EventCard
        eventName="VOCALOID NIGHT FEST 2026"
        schedule="2026-08-20T00:00:00.000Z"
        location="홍대 클럽 빵"
        genre="보컬로이드, 동인음악"
      />
    </div>
  </Pair>
);

export const PastEvent = () => (
  <Pair>
    <EventCard
      eventName="랜덤플레이댄스 @ 신촌"
      schedule="2026-03-10T00:00:00.000Z"
      timeStart="2026-03-10T06:00:00.000Z"
      location="신촌 연세로"
      genre="랜플댄"
      isPast={true}
    />
  </Pair>
);

export const WithImage = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <EventCard
        eventName="DJ NIGHT — 전자음악 페스티벌"
        schedule="2026-07-20T00:00:00.000Z"
        timeStart="2026-07-20T15:00:00.000Z"
        timeEnd="2026-07-20T22:00:00.000Z"
        location="이태원 클럽 CAKESHOP"
        genre="전자음악"
        imgUrl="https://picsum.photos/96/128?grayscale"
      />
      <EventCard
        eventName="리듬게임 이벤트 파티"
        schedule="2026-07-28T00:00:00.000Z"
        location="건대 클럽 NB2"
        genre="리듬게임, Any Song (복합)"
        imgUrl="https://picsum.photos/96/128?blur"
      />
    </div>
  </Pair>
);
