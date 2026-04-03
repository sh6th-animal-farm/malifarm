type SignupProgressProps = {
  totalSteps: number;
  currentDotIndex: number;
};

export default function SignupProgress({
  totalSteps,
  currentDotIndex,
}: SignupProgressProps) {
  return (
    <div className="flex justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 rounded-full transition-all ${
            currentDotIndex === idx + 1 ? "w-6 bg-green-600" : "w-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}