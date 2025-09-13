import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      nav('/leads');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
  <div className="max-w-sm mx-auto animate-[fadeIn_180ms_ease-out]">
      <h1 className="text-2xl font-semibold mb-6">Welcome back</h1>
  <form onSubmit={submit} className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" required placeholder="••••••••" />
        </div>
        <Button disabled={loading} type="submit">{loading? 'Signing in...' : 'Sign in'}</Button>
      </form>
      <p className="text-sm mt-4 text-gray-600">No account? <Link className="underline" to="/register">Create one</Link></p>
    </div>
  );
}
