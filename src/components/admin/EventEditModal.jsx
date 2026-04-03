import { useState } from "react";
import { useEventForm } from "../../hooks/useEventForm";
import { buildSubmitData, inputClass, isValidUrl, validateTimeOrder } from "../../utils/eventFormUtils";
import { ModalShell, ModalCloseButton } from "../form/ModalShell";
import { AutocompleteInput } from "../form/AutocompleteInput";
import { LocationField } from "../form/LocationField";
import { TimeFields } from "../form/TimeFields";
import { GenreSelector } from "../form/GenreSelector";

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-left text-red-500 dark:text-red-400 pl-2 mt-1">{message}</p>;
}

export default function EventEditModal({
    event,
    onSave,
    onClose,
    isSaving,
    locationSuggestions = [],
    eventNameSuggestions = [],
    genreSuggestions = [],
}) {
    const isNew = !event?.id;

    const { form, set, toggleGenre, addCustomGenres, removeGenre, locationTbd, handleLocationTbdChange } =
        useEventForm(event, onClose);

    const [imgUrl, setImgUrl] = useState(event?.img_url ?? "");
    const [confirm, setConfirm] = useState(event?.confirm ?? false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (f = form, img = imgUrl) => {
        const errs = {};
        if (!f.event_name.trim()) errs.event_name = "이벤트명을 입력해주세요.";
        if (!f.schedule) errs.schedule = "날짜를 선택해주세요.";
        if (!f.location.trim()) errs.location = "장소를 입력해주세요.";
        if ((f.genre?.length ?? 0) === 0) errs.genre = "장르를 하나 이상 선택해주세요.";
        if (!f.event_url.trim()) {
            errs.event_url = "SNS 링크를 입력해주세요.";
        } else if (!isValidUrl(f.event_url)) {
            errs.event_url = "올바른 URL 형식이 아닙니다. (https://...)";
        }
        if (img && !isValidUrl(img)) errs.img_url = "올바른 URL 형식이 아닙니다. (https://...)";
        const timeErr = validateTimeOrder(f);
        if (timeErr) errs.time = timeErr;
        return errs;
    };

    const handleSubmit = e => {
        e.preventDefault();
        setSubmitted(true);
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        const data = { ...buildSubmitData(form), confirm, img_url: imgUrl };
        if (!data.img_url) data.img_url = null;
        if (event?.id) data.id = event.id;
        onSave(data);
    };

    const revalidate = (nextForm = form, nextImg = imgUrl) => {
        if (submitted) setErrors(validate(nextForm, nextImg));
    };

    const handleSet = (field, val) => {
        set(field, val);
        revalidate({ ...form, [field]: val });
    };

    const isDisabled = isSaving;

    return (
        <ModalShell onClose={onClose} maxHeight="calc(100dvh - 5rem)">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/70 dark:border-gray-800">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {isNew ? "이벤트 추가" : "이벤트 수정"}
                </h2>
                <ModalCloseButton onClick={onClose} />
            </div>

            {/* Form */}
            <form id="event-edit-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                {/* 이벤트명 */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                        이벤트명 <span className="text-red-500">*</span>
                    </label>
                    <AutocompleteInput
                        value={form.event_name}
                        onChange={v => handleSet("event_name", v)}
                        suggestions={eventNameSuggestions}
                        placeholder="이벤트 이름을 입력하세요"
                        className={`${inputClass}${errors.event_name ? " border-red-400 dark:border-red-500" : ""}`}
                        required
                    />
                    <FieldError message={errors.event_name} />
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
                            onChange={e => handleSet("schedule", e.target.value)}
                            className={`${inputClass}${errors.schedule ? " border-red-400 dark:border-red-500" : ""}`}
                        />
                        <FieldError message={errors.schedule} />
                    </div>
                    <div>
                        <LocationField
                            value={form.location}
                            onChange={v => handleSet("location", v)}
                            suggestions={locationSuggestions}
                            locationTbd={locationTbd}
                            onTbdChange={handleLocationTbdChange}
                        />
                        <FieldError message={errors.location} />
                    </div>
                </div>

                {/* 시간 */}
                <div className="space-y-1">
                    <TimeFields value={form} onChange={(field, val) => {
                        set(field, val);
                        revalidate({ ...form, [field]: val });
                    }} />
                    <FieldError message={errors.time} />
                </div>

                {/* 장르 */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                        장르 <span className="text-red-500">*</span>
                    </label>
                    <GenreSelector
                        genres={form.genre}
                        onToggle={g => { toggleGenre(g); if (submitted) setErrors(validate()); }}
                        onAdd={g => { addCustomGenres(g); if (submitted) setErrors(validate()); }}
                        onRemove={g => { removeGenre(g); if (submitted) setErrors(validate()); }}
                        suggestions={genreSuggestions}
                    />
                    <FieldError message={errors.genre} />
                </div>

                {/* URL 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                            이벤트 SNS 링크 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={form.event_url}
                                onChange={e => handleSet("event_url", e.target.value)}
                                placeholder="https://..."
                                className={`${inputClass} pr-9${errors.event_url ? " border-red-400 dark:border-red-500" : ""}`}
                            />
                            {isValidUrl(form.event_url) && (
                                <a
                                    href={form.event_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={-1}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                        <FieldError message={errors.event_url} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                            이미지 URL
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={imgUrl}
                                onChange={e => { setImgUrl(e.target.value); revalidate(form, e.target.value); }}
                                placeholder="https://..."
                                className={`${inputClass} pr-9${errors.img_url ? " border-red-400 dark:border-red-500" : ""}`}
                            />
                            {isValidUrl(imgUrl) && (
                                <a
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={-1}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                        <FieldError message={errors.img_url} />
                    </div>
                </div>

                {/* 기타 정보 */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-left pl-2 text-gray-700 dark:text-gray-300">
                        기타 정보
                    </label>
                    <textarea
                        value={form.etc}
                        onChange={e => set("etc", e.target.value)}
                        placeholder="추가 정보를 입력하세요"
                        rows={3}
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {/* 표출 여부 토글 */}
                <div
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 cursor-pointer select-none"
                    onClick={() => setConfirm(v => !v)}
                >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">표출 여부</p>
                    <div
                        role="switch"
                        aria-checked={confirm}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                            confirm ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                confirm ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </div>
                </div>
            </form>

            {/* Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-200/70 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    취소
                </button>
                <button
                    type="submit"
                    form="event-edit-form"
                    disabled={isDisabled}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-indigo-600 active:bg-indigo-700 mouse:hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving && (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isNew ? "추가하기" : "저장하기"}
                </button>
            </div>
        </ModalShell>
    );
}
