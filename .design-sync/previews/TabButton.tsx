import { TabButton } from 'ankr-design-system';

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 16, background: '#111827' }}>{children}</div>
  </div>
);

export const States = () => (
  <Pair>
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <TabButton isActive={true}>예정 행사</TabButton>
      <TabButton isActive={false}>지난 행사</TabButton>
      <TabButton isActive={false}>즐겨찾기</TabButton>
    </div>
  </Pair>
);

export const MultipleActive = () => (
  <Pair>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">첫 번째 탭 활성</div>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton isActive={true}>캘린더</TabButton>
          <TabButton isActive={false}>목록</TabButton>
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">두 번째 탭 활성</div>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton isActive={false}>캘린더</TabButton>
          <TabButton isActive={true}>목록</TabButton>
        </div>
      </div>
    </div>
  </Pair>
);
