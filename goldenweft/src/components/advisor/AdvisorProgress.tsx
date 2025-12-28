export default function AdvisorProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="w-full px-6 mb-8">
      <div className="h-1 bg-black/10 rounded">
        <div
          className="h-1 bg-black rounded transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
