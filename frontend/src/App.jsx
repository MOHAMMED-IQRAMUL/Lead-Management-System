import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LeadsPage from './pages/LeadsPage';
import LeadFormPage from './pages/LeadFormPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function PrivateRoute({ children }) {
  const { user, loading, waking } = useAuth();
  if (loading || waking) return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <div className="text-sm text-gray-600">{waking ? 'Waking up backend on Render…' : 'Loading…'}</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const { waking } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {waking && (
        <div className="bg-blue-50 text-blue-700 text-xs py-2 text-center border-b">Waking up backend on Render…</div>
      )}
      <main className="flex-1 px-4 sm:px-6 py-6 bg-gray-50">
        <div className="max-w-6xl w-full mx-auto animate-[fadeIn_200ms_ease-out]">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/leads" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leads" element={<PrivateRoute><LeadsPage /></PrivateRoute>} />
            <Route path="/leads/new" element={<PrivateRoute><LeadFormPage mode="create" /></PrivateRoute>} />
            <Route path="/leads/:id/edit" element={<PrivateRoute><LeadFormPage mode="edit" /></PrivateRoute>} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
