import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="text-center animate-[fadeIn_180ms_ease-out]">
        <div className="text-7xl font-bold tracking-tight">404</div>
        <p className="mt-2 text-gray-600">Page not found</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/"><Button variant="secondary">Home</Button></Link>
          <Link to="/leads"><Button>Go to Leads</Button></Link>
        </div>
      </div>
    </div>
  );
}
