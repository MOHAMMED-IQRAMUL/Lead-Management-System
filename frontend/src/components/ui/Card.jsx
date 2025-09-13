export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>{children}</div>
  );
}
