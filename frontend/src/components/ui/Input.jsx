export default function Input({ className = '', ...props }) {
  return <input className={`border rounded-md px-3 py-2 text-sm w-full transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
}
