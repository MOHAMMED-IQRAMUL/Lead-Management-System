export default function Select({ className = '', children, ...props }) {
  return (
    <select className={`border rounded-md px-3 py-2 text-sm w-full bg-white transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props}>
      {children}
    </select>
  );
}
