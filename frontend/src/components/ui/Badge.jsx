const map = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-gray-100 text-gray-700 border-gray-200',
  won: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200'
};

export default function Badge({ children, tone = 'default', className = '' }) {
  const cls = map[tone] || map.default;
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs border ${cls} ${className}`}>{children}</span>;
}
