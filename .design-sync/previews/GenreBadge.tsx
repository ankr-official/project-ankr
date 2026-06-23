import { GenreBadge } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const SingleGenre = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
  </Pair>
);
