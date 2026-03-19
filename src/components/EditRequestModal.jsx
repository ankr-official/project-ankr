import { useState, useMemo } from "react";
import { useEventForm } from "../hooks/useEventForm";
import { useAuth } from "../contexts/AuthContext";
import {
  buildSubmitData,
  inputClass,
  isoToTime,
  isoToLocal,
  toArray,
} from "../utils/eventFormUtils";
import { ModalShell, ModalCloseButton } from "./form/ModalShell";
import { AutocompleteInput } from "./form/AutocompleteInput";
import { LocationField } from "./form/LocationField";
import { TimeFields } from "./form/TimeFields";
import { GenreSelector } from "./form/GenreSelector";

export default function EditRequestModal({
  event,
  onSubmit,
  onClose,
  isSaving,
  locationSuggestions = [],
  eventNameSuggestions = [],
  genreSuggestions = [],
  isLimitReached = false,
  requestCount = 0,
  dailyLimit = 10,
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
  } = useEventForm(event, onClose);

  const [reason, setReason] = useState("");
  const [deleteRequest, setDeleteRequest] = useState(false);

  const initial = useMemo(
    () => ({
      event_name: event?.event_name ?? "",
      schedule: isoToLocal(event?.schedule) || "",
      location: event?.location ?? "",
      genre: toArray(event?.genre).slice().sort().join(","),
      event_url: event?.event_url ?? "",
      time_start: isoToTime(event?.time_start),
      time_entrance: isoToTime(event?.time_entrance),
      time_end: isoToTime(event?.time_end),
      etc: event?.etc ?? "",
    }),
    [event],
  );

  const hasChanges = useMemo(
    () =>
      form.event_name !== initial.event_name ||
      form.schedule !== initial.schedule ||
      form.location !== initial.location ||
      form.genre.slice().sort().join(",") !== initial.genre ||
      form.event_url !== initial.event_url ||
      form.time_start !== initial.time_start ||
      form.time_entrance !== initial.time_entrance ||
      form.time_end !== initial.time_end ||
      form.etc !== initial.etc,
    [form, initial],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (deleteRequest) {
      onSubmit({ deleteRequest: true }, reason.trim());
    } else {
      const data = buildSubmitData(form);
      onSubmit(data, reason.trim());
    }
  };

  const [showHint, setShowHint] = useState(false);

  const missingFields = deleteRequest
    ? !reason.trim()
      ? ["수정 사유"]
      : []
    : [
        !reason.trim() && "수정 사유",
        !form.event_name.trim() && "이벤트명",
        !form.schedule && "날짜",
        !form.location.trim() && "장소",
        form.genre.length === 0 && "장르",
        !hasChanges && "변경점",
      ].filter(Boolean);

  const isDisabled =
    isSaving ||
    isLimitReached ||
    !reason.trim() ||
    (!deleteRequest && !hasChanges) ||
    (!deleteRequest &&
      (!form.event_name.trim() || !form.schedule || !form.location.trim() || form.genre.length === 0));

  return (
    <ModalShell onClose={onClose} zIndex={60}>
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200/70 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-left text-gray-900 dark:text-white">
            정보 수정 요청
          </h2>
          <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-0.5">
            수정이 필요한 내용을 변경하고 수정 사유를 입력해 주세요.
          </p>
        </div>
        <ModalCloseButton onClick={onClose} />
      </div>

      {/* Form */}
      <form
        id="edit-request-form"
        onSubmit={handleSubmit}
        className="px-6 py-5 space-y-5 overflow-y-auto flex-1"
      >
        {/* 수정 사유 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
            수정 사유 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="수정이 필요한 이유를 간략히 설명해 주세요"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <fieldset
          disabled={deleteRequest}
          className="border-t border-gray-200/70 dark:border-gray-700 pt-4 space-y-5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <p className="text-xs text-left pl-2 text-gray-400 dark:text-gray-500">
            수정할 항목만 변경해 주세요.
          </p>

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
              suggestions={genreSuggestions}
            />
          </div>

          {/* 이벤트 SNS 링크 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
              이벤트 SNS 링크
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
        </fieldset>

        {/* 삭제 요청 */}
        <label className="flex items-center bg-red-100/50 dark:bg-red-900/50 rounded-md p-4 gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={deleteRequest}
            onChange={(e) => setDeleteRequest(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-500 accent-red-500 cursor-pointer shrink-0"
          />
          <div className="text-left">
            <span className="text-sm font-medium text-red-600 dark:text-red-200">
              이벤트 삭제 요청
            </span>
            <p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">
              행사가 취소되었거나 잘못 등록된 경우 삭제를 요청할 수 있습니다. 위
              수정 내용은 무시됩니다.
            </p>
          </div>
        </label>
      </form>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200/70 dark:border-gray-800 space-y-2">
        {isLimitReached && (
          <p className="text-xs text-center text-red-500 dark:text-red-400">
            오늘 수정 요청 가능 횟수({dailyLimit}회)를 초과했습니다. 내일 다시
            시도해 주세요.
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
              form="edit-request-form"
              disabled={isDisabled}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              요청하기{!isAdmin && ` ${requestCount} / ${dailyLimit}`}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
