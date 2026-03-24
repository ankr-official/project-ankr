const isAprilFools = () => {
  const now = new Date();
  return now.getMonth() === 3 && now.getDate() === 1;
};

export function AprilFoolsBanner() {
  if (!isAprilFools()) return null;

  return (
    <div className="mb-8 w-full overflow-hidden rounded-lg border border-yellow-400/60 dark:border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/40 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-2.5">
        <span className="mt-0.5 text-lg leading-none select-none">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-left text-yellow-900 dark:text-yellow-200">
            오늘의 모든 행사 정보는 실제입니다.
          </p>
          <p className="mt-0.5 text-xs text-left text-yellow-700 dark:text-yellow-400">
            진짜입니다. 믿어주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
