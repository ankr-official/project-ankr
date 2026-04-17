import { AutocompleteInput } from "./AutocompleteInput";
import { inputClass } from "../../utils/eventFormUtils";

export function LocationField({
  value,
  onChange,
  suggestions = [],
  locationTbd,
  onTbdChange,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
        장소 <span className="text-red-500">*</span>{" "}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          (예: 합정 아로아로)
        </span>
      </label>
      <AutocompleteInput
        value={locationTbd ? "장소 미정" : value}
        onChange={onChange}
        suggestions={suggestions}
        disabled={locationTbd}
        placeholder="장소를 입력하세요"
        className={`${inputClass} ${locationTbd ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      <label className="w-full pl-2 inline-flex items-center gap-2 mt-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={locationTbd}
          onChange={(e) => onTbdChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded accent-indigo-600"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          장소 미정
        </span>
      </label>
    </div>
  );
}
