/**
 * Text input field with optional label and error message.
 *
 * @param {{ label?: string, placeholder?: string, value?: string, defaultValue?: string, onChange?: (e: import('react').ChangeEvent<HTMLInputElement>) => void, error?: string, disabled?: boolean, type?: string, name?: string, id?: string, required?: boolean, className?: string }} props
 */
export function Input({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
  disabled = false,
  type = 'text',
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
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          error
            ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500',
          'focus:outline-none focus:ring-1',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : '',
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
