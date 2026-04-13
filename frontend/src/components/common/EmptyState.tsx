interface EmptyStateProps {
  message: string;
  iconText?: string;
  className?: string;
}

export default function EmptyState({
  message,
  iconText = "!",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`mb-8 flex min-h-570 items-center justify-center rounded-lg bg-white px-6 py-10 text-center shadow-std ${className}`}
    >
      <div>
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 font-header-02 text-gray-400"
          aria-hidden="true"
        >
          {iconText}
        </div>
        <p className="text-[16px] text-gray-400">{message}</p>
      </div>
    </div>
  );
}
