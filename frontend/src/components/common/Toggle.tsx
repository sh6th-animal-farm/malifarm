interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Toggle({
  checked,
  onChange,
  className = "",
  disabled = false,
  ariaLabel = "토글",
}: ToggleProps) {
  return (
    <label
      className={`relative inline-flex h-7 w-12 items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="h-7 w-12 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600" />
      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

