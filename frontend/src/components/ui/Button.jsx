export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-600 shadow-sm hover:shadow',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400 shadow-sm hover:shadow',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600 shadow-sm hover:shadow'
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>
  );
}
