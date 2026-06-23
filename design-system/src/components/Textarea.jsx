/**
 * 라벨과 오류 메시지를 지원하는 여러 줄 텍스트 영역.
 *
 * @param {{ label?: string, placeholder?: string, value?: string, onChange?: (e: import('react').ChangeEvent<HTMLTextAreaElement>) => void, error?: string, disabled?: boolean, rows?: number, name?: string, id?: string, required?: boolean, className?: string }} props
 */
export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  rows = 4,
  name,
  id,
  required = false,
  className = '',
}) {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors resize-y',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          error
            ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500',
          'focus:outline-none focus:ring-1',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
