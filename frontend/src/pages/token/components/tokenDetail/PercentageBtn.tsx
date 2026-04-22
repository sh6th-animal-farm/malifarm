interface PercentageBtnProps {
  type: string; // 'buy' or 'sell'
  onClick: (value: number) => void;
  gapClassName?: string;
}

const PERCENT_OPTIONS = [25, 50, 75, 100];

export default function PercentageBtn({
  type,
  onClick,
  gapClassName = 'gap-2',
}: PercentageBtnProps) {
  const activeStyles =
    type === 'buy'
      ? 'active:border-error active:bg-error-light active:text-error'
      : 'active:border-info active:bg-info-light active:text-info';

  return (
    <div className={`flex ${gapClassName}`}>
      {PERCENT_OPTIONS.map((percent) => (
        <button
          key={percent}
          type="button"
          onClick={() => onClick(percent)}
          className={`
            flex-1 h-[38px] max-w-[88px] border border-gray-200 bg-white rounded-[var(--radius-s)]
            font-caption-01 text-gray-600 cursor-pointer transition-colors hover:bg-gray-50
            ${activeStyles}
          `}
        >
          {percent}%
        </button>
      ))}
    </div>
  );
}
