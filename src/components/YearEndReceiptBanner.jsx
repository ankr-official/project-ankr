import { Link } from "react-router-dom";

export function YearEndReceiptBanner() {
    return (
        <Link
            to="/year-end-receipt"
            className="block mb-8 w-full overflow-hidden rounded-lg border border-amber-400/70 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 shadow-[0_0_40px_rgba(248,250,252,0.08)] ring-1 ring-amber-500/20 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_0_55px_rgba(250,250,250,0.18)]"
        >
            <div className="flex relative flex-col gap-3 px-4 py-3 md:px-6 md:py-4 md:flex-row md:items-center md:justify-between">
                {/* subtle sparkling overlay */}
                <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_10%_0%,rgba(250,250,250,0.18),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(251,191,36,0.28),transparent_55%)]" />
                </div>

                <div className="flex gap-3 justify-center items-center w-full md:justify-start">
                    {/* ticket-like accent bar */}

                    <div className="flex flex-col w-full">
                        <span className="text-[0.65rem] font-mono tracking-[0.4em] text-amber-200/80 uppercase md:text-xs">
                            2025 Year-End Special
                        </span>
                        <span className="mt-0.5 text-sm font-semibold text-amber-50 md:text-base">
                            올 한 해의 행사 기록으로 YEAR-END RECEIPT를 만들어
                            보세요 (BETA)
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
