export default function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
      <div className="animate-pulse divide-y">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="grid grid-cols-12 gap-2 p-3">
            {[...Array(cols)].map((__, c) => (
              <div key={c} className="col-span-2 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
