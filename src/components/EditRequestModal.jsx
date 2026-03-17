import { useState } from "react";
import { useEventForm } from "../hooks/useEventForm";
import { buildSubmitData, inputClass } from "../utils/eventFormUtils";
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
}) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (deleteRequest) {
      onSubmit({ deleteRequest: true }, reason.trim());
    } else {
      const data = buildSubmitData(form);
      onSubmit(data, reason.trim());
    }
  };

  const isDisabled =
    isSaving ||
    !reason.trim() ||
    (!deleteRequest &&
      (!form.event_name.trim() || !form.schedule || form.genre.length === 0));

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
      <div className="flex gap-2 px-6 py-4 border-t border-gray-200/70 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          form="edit-request-form"
          disabled={isDisabled}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving && (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          요청
        </button>
      </div>
    </ModalShell>
  );
}
