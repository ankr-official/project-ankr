import { Link } from "react-router-dom";

export function YearEndReceiptBanner() {
  return (
    <Link
      to="/year-end-receipt"
      className="block w-full mb-8 border border-dashed border-gray-500 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 hover:border-indigo-400 transition-colors"
    >
      <div className="px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center justify-center gap-3 w-full">
          <div className="h-full border-l-4 border-dotted border-gray-500 mr-1" />
          <div className="flex flex-col">
            <span className="text-xs font-mono tracking-[0.25em] text-gray-400 uppercase">
              Year-End Special
            </span>
            <span className="text-sm md:text-base font-semibold text-gray-100">
              2024 ANKR YEAR-END RECEIPT 를 만들어 보세요
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm font-mono text-gray-300">
          <span className="px-3 py-1 border border-gray-600 rounded-sm bg-black/40">
            Make My Receipt
          </span>
        </div>
      </div>
    </Link>
  );
}
