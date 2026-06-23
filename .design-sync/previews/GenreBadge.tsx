import { GenreBadge } from 'ankr-design-system';

export const SingleGenre = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
    <GenreBadge genre="원곡" />
    <GenreBadge genre="우치이베" />
    <GenreBadge genre="랜플댄" />
    <GenreBadge genre="리믹스" />
    <GenreBadge genre="전자음악" />
    <GenreBadge genre="동인음악" />
    <GenreBadge genre="리듬게임" />
    <GenreBadge genre="보컬로이드" />
    <GenreBadge genre="코스프레" />
    <GenreBadge genre="Any Song (복합)" />
  </div>
);

export const MultipleGenres = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
    <GenreBadge genre="원곡, 리믹스" />
    <GenreBadge genre="전자음악, 동인음악, 랜플댄" />
    <GenreBadge genre="보컬로이드, Any Song (복합)" />
  </div>
);

export const DarkMode = () => (
  <div className="dark" style={{ background: '#111827', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <GenreBadge genre="원곡" />
    <GenreBadge genre="리믹스" />
    <GenreBadge genre="보컬로이드" />
    <GenreBadge genre="전자음악" />
    <GenreBadge genre="원곡, 리믹스" />
    <GenreBadge genre="전자음악, 동인음악" />
  </div>
);
