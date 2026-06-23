// Modal uses fixed inset-0 — preview renders the panel inline without backdrop.
// Pair provides dark class on the right half; dark: Tailwind variants activate automatically.

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ModalPanel = ({ title, mobileMode = false, children }: {
  title?: string; mobileMode?: boolean; children: React.ReactNode;
}) => (
  <div className={`${mobileMode ? 'rounded-t-3xl' : 'rounded-xl'} w-full bg-gray-200 dark:bg-gray-900 overflow-hidden shadow-xl`}>
    {mobileMode ? (
      <div className="relative w-full py-6">
        <span className="absolute top-3 left-4 text-sm text-indigo-600 dark:text-indigo-300">닫기</span>
        <div className="w-10 h-1.5 mx-auto bg-gray-400 dark:bg-gray-600 rounded-full" />
        <span className="absolute top-3 right-4 text-sm text-indigo-600 dark:text-indigo-300">수정 요청</span>
      </div>
    ) : (
      <div className="flex items-center justify-between px-5 pt-5 gap-2">
        {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>}
        <div className="ml-auto p-1 w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
          <XIcon />
        </div>
      </div>
    )}
    <div className="px-5 pb-5 pt-3">{children}</div>
  </div>
);

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: 12, background: '#f3f4f6' }}>{children}</div>
    <div className="dark" style={{ flex: 1, padding: 12, background: '#111827' }}>{children}</div>
  </div>
);

export const MobileSheet = () => (
  <Pair>
    <ModalPanel mobileMode>
      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="w-full h-28 rounded-lg bg-gray-300 dark:bg-gray-700" />
        <div className="grid grid-cols-2 gap-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
          <div className="space-y-1.5">
            <p><span className="text-gray-500 dark:text-gray-400">일정</span> 2026-07-15 (수)</p>
            <p><span className="text-gray-500 dark:text-gray-400">장르</span> 원곡, 리믹스</p>
            <p><span className="text-gray-500 dark:text-gray-400">장소</span> 홍대 클럽 FF</p>
          </div>
          <div className="space-y-1.5">
            <p><span className="text-gray-500 dark:text-gray-400">입장</span> 21:00</p>
            <p><span className="text-gray-500 dark:text-gray-400">시작</span> 22:00</p>
            <p><span className="text-gray-500 dark:text-gray-400">종료</span> 05:00</p>
          </div>
        </div>
      </div>
    </ModalPanel>
  </Pair>
);

export const DesktopCentered = () => (
  <Pair>
    <ModalPanel title="VOCALOID NIGHT FEST 2026">
      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="w-full h-32 rounded-lg bg-gray-300 dark:bg-gray-700" />
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg space-y-1.5">
          <p><span className="text-gray-500 dark:text-gray-400 w-10 inline-block">일정</span> 2026-08-20 (목)</p>
          <p><span className="text-gray-500 dark:text-gray-400 w-10 inline-block">장르</span> 보컬로이드, 동인음악</p>
          <p><span className="text-gray-500 dark:text-gray-400 w-10 inline-block">장소</span> 홍대 클럽 빵</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="flex-1 py-1.5 text-xs text-white bg-indigo-600 rounded-lg">Google Calendar에 추가</button>
          <button className="flex-1 py-1.5 text-xs text-white bg-blue-500 rounded-lg">X(Twitter)에 공유</button>
        </div>
      </div>
    </ModalPanel>
  </Pair>
);
