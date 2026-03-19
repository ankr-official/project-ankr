import { useState } from "react";
import { useEventForm } from "../hooks/useEventForm";
import { useAuth } from "../contexts/AuthContext";
import { buildSubmitData, inputClass } from "../utils/eventFormUtils";
import { ModalShell, ModalCloseButton } from "./form/ModalShell";
import { AutocompleteInput } from "./form/AutocompleteInput";
import { LocationField } from "./form/LocationField";
import { TimeFields } from "./form/TimeFields";
import { GenreSelector } from "./form/GenreSelector";

export default function ReportEventModal({
  onSubmit,
  onClose,
  isSaving,
  isLimitReached = false,
  reportCount = 0,
  dailyLimit = 10,
  locationSuggestions = [],
  eventNameSuggestions = [],
}) {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const {
    form,
    set,
    toggleGenre,
    addCustomGenres,
    removeGenre,
    locationTbd,
    handleLocationTbdChange,
  } = useEventForm({}, onClose);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...buildSubmitData(form), confirm: false };
    if (!data.event_url) delete data.event_url;
    onSubmit(data);
  };

  const [showHint, setShowHint] = useState(false);

  const missingFields = [
    !form.event_name.trim() && "이벤트명",
    !form.schedule && "날짜",
    !form.location.trim() && "장소",
    form.genre.length === 0 && "장르",
    !form.event_url.trim() && "이벤트 SNS 링크",
  ].filter(Boolean);

  const isDisabled =
    isSaving ||
    isLimitReached ||
    !form.event_name.trim() ||
    !form.schedule ||
    !form.location.trim() ||
    form.genre.length === 0 ||
    !form.event_url.trim();

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200/70 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-left text-gray-900 dark:text-white">
            이벤트 제보하기
          </h2>
          <p className="text-xs text-left text-gray-700 dark:text-gray-200 mt-0.5">
            트래픽을 방지하기 위해 하루 최대 10회까지 제보 가능합니다.
          </p>
          <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-0.5">
            *1~3일 이내에 담당자가 확인 및 검토하여 게시합니다.
          </p>
        </div>
        <ModalCloseButton onClick={onClose} />
      </div>

      {/* Form */}
      <form
        id="report-event-form"
        onSubmit={handleSubmit}
        className="px-6 py-5 space-y-5 overflow-y-auto flex-1"
      >
        {/* 이벤트명 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
            이벤트명 <span className="text-red-500">*</span>
          </label>
          <AutocompleteInput
            value={form.event_name}
            onChange={(v) => set("event_name", v)}
            suggestions={eventNameSuggestions}
            placeholder="이벤트 이름을 입력하세요"
            className={inputClass}
            required
          />
        </div>

        {/* 날짜 + 장소 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.schedule}
              onChange={(e) => set("schedule", e.target.value)}
              className={inputClass}
            />
          </div>
          <LocationField
            value={form.location}
            onChange={(v) => set("location", v)}
            suggestions={locationSuggestions}
            locationTbd={locationTbd}
            onTbdChange={handleLocationTbdChange}
          />
        </div>

        <TimeFields value={form} onChange={(field, val) => set(field, val)} />

        {/* 장르 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
            장르 <span className="text-red-500">*</span>
          </label>
          <GenreSelector
            genres={form.genre}
            onToggle={toggleGenre}
            onAdd={addCustomGenres}
            onRemove={removeGenre}
          />
        </div>

        {/* 이벤트 SNS 링크 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
            이벤트 SNS 링크 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.event_url}
            onChange={(e) => set("event_url", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* 기타 정보 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
            기타 정보
          </label>
          <textarea
            value={form.etc}
            onChange={(e) => set("etc", e.target.value)}
            placeholder="추가 정보를 입력하세요"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200/70 dark:border-gray-800">
        {isLimitReached && (
          <p className="text-xs text-center text-red-500 dark:text-red-400">
            오늘 제보 가능 횟수({dailyLimit}회)를 초과했습니다. 내일 다시 시도해
            주세요.
          </p>
        )}
        {showHint && missingFields.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
            필수 항목을 채워주세요:{" "}
            <span className="font-medium">{missingFields.join(", ")}</span>
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <div
            className="flex-1"
            onClick={() => {
              if (isDisabled && !isSaving && !isLimitReached) setShowHint(true);
            }}
          >
            <button
              type="submit"
              form="report-event-form"
              disabled={isDisabled}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              제보하기{!isAdmin && ` ${reportCount} / ${dailyLimit}`}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
