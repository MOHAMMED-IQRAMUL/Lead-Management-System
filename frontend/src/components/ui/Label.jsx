export default function Label({ className = '', children, ...props }) {
  return (
    <label className={`text-xs font-medium text-gray-700 ${className}`} {...props}>{children}</label>
  );
}
