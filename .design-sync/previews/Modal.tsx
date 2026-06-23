// Modal uses fixed inset-0 — preview renders the panel appearance inline
// without the backdrop overlay to avoid blank iframe issue.

const ModalPanel = ({ title, mobileMode = false, dark = false, children }: {
  title?: string; mobileMode?: boolean; dark?: boolean; children: React.ReactNode;
}) => (
  <div className={dark ? 'dark' : ''} style={{ background: dark ? '#111827' : '#f3f4f6' }}>
    <div
      style={{ width: mobileMode ? 375 : 640, margin: '0 auto' }}
      className={`${mobileMode ? 'rounded-t-3xl' : 'rounded-xl'} bg-gray-200 dark:bg-gray-900 transition-colors overflow-hidden shadow-2xl`}
    >
      {/* 모바일 헤더: 드래그 바 + 닫기 + 액션 */}
      {mobileMode && (
        <div className="relative w-full py-6">
          <span className="absolute top-3 left-6 text-sm text-indigo-600 dark:text-indigo-300">닫기</span>
          <div className="w-12 h-1.5 mx-auto bg-gray-400 dark:bg-gray-300 rounded-full" />
          <span className="absolute top-3 right-6 text-sm text-indigo-600 dark:text-indigo-300">수정 요청</span>
        </div>
      )}
      <div className="px-4 py-4 lg:px-8 lg:py-8">
        {/* 데스크탑 제목 + X버튼 */}
        {!mobileMode && (
          <div className="flex items-center justify-between mb-4 gap-2">
            {title
              ? <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              : <span />
            }
            <div className="p-1 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  </div>
);

export const MobileSheet = () => (
  <ModalPanel mobileMode title="CLUB DIMENSION Vol.14">
    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
      <div className="w-full h-40 rounded-lg bg-gray-300 dark:bg-gray-700" />
      <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
        <div className="space-y-2">
          <p><span className="text-gray-500">일정</span> 2026-07-15 (수)</p>
          <p><span className="text-gray-500">장르</span> 원곡, 리믹스</p>
          <p><span className="text-gray-500">장소</span> 홍대 클럽 FF</p>
        </div>
        <div className="space-y-2">
          <p><span className="text-gray-500">입장</span> 21:00</p>
          <p><span className="text-gray-500">시작</span> 22:00</p>
          <p><span className="text-gray-500">종료</span> 05:00</p>
        </div>
      </div>
    </div>
  </ModalPanel>
);

export const DesktopCentered = () => (
  <ModalPanel title="VOCALOID NIGHT FEST 2026">
    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
      <div className="w-full h-48 rounded-lg bg-gray-300 dark:bg-gray-700" />
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
        <p><span className="text-gray-500 w-12 inline-block">일정</span> 2026-08-20 (목)</p>
        <p><span className="text-gray-500 w-12 inline-block">장르</span> 보컬로이드, 동인음악</p>
        <p><span className="text-gray-500 w-12 inline-block">장소</span> 홍대 클럽 빵</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg">Google Calendar에 추가</button>
        <button className="flex-1 px-4 py-2 text-sm text-white bg-blue-500 rounded-lg">X(Twitter)에 공유하기</button>
      </div>
    </div>
  </ModalPanel>
);

export const DarkMode = () => (
  <ModalPanel mobileMode dark>
    <div className="space-y-3 text-sm text-gray-300">
      <h2 className="text-xl font-bold text-white">CLUB DIMENSION Vol.14</h2>
      <div className="w-full h-36 rounded-lg bg-gray-700" />
      <div className="bg-gray-800 p-4 rounded-xl space-y-2">
        <p><span className="text-gray-500">일정</span> 2026-07-15 (수) 🌙 22:00 ~ 05:00</p>
        <p><span className="text-gray-500">장르</span> 원곡, 리믹스</p>
        <p><span className="text-gray-500">장소</span> 홍대 클럽 FF</p>
      </div>
    </div>
  </ModalPanel>
);
