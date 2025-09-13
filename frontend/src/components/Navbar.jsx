import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg tracking-tight">Lead Manager</Link>
        <nav className="flex items-center gap-3 text-sm">
          {user && (
            <NavLink to="/leads" className={({isActive})=>`px-3 py-1.5 rounded-md ${isActive? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Leads</NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={({isActive})=>`px-3 py-1.5 rounded-md flex items-center gap-2 ${isActive? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-blue-700'}`}>
                <FiLogIn /> Login
              </NavLink>
              <NavLink to="/register" className={({isActive})=>`px-3 py-1.5 rounded-md flex items-center gap-2 ${isActive? 'bg-green-600 text-white' : 'hover:bg-green-50 text-green-700'}`}>
                <FiUserPlus /> Register
              </NavLink>
            </>
          )}
          {user && (
            <button onClick={logout} className="px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-red-50 text-red-700" type="button">
              <FiLogOut /> Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
