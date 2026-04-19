type SignupProgressProps = {
  totalSteps: number;
  currentDotIndex: number;
  onStepClick?: (dotIndex: number) => void;
};

export default function SignupProgress({
  totalSteps,
  currentDotIndex,
  onStepClick,
}: SignupProgressProps) {
  return (
    <div className="flex justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const dotIndex = idx + 1;
        const isActive = currentDotIndex === dotIndex;
        const isPast = dotIndex < currentDotIndex;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (isPast) onStepClick?.(dotIndex);
            }}
            disabled={!isPast}
            aria-label={`${dotIndex}단계로 이동`}
            className={`h-2 rounded-full transition-all ${
              isActive ? "w-6 bg-green-600" : "w-2 bg-gray-300"
            } ${
              isPast ? "cursor-pointer hover:bg-gray-400" : "cursor-default"
            } disabled:opacity-100`}
          />
        );
      })}
    </div>
  );
}