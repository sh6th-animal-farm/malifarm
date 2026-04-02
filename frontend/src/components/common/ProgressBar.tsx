export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-600 rounded-r-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
