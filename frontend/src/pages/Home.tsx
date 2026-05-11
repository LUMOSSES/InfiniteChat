import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl md:text-7xl font-bold text-ink tracking-tight mb-6">
        InfiniteChat
      </h1>
      <p className="text-xl text-ink-light max-w-xl mb-12 leading-relaxed">
        Real-time messaging, moments sharing, and beautiful message templates — all in one place.
      </p>
      {isAuthenticated ? (
        <Link
          to="/chat"
          className="px-10 py-4 bg-ink text-white rounded-2xl text-base font-bold tracking-wider
                     hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          OPEN CHAT
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-10 py-4 border-2 border-ink text-ink rounded-2xl text-base font-bold tracking-wider
                       hover:bg-ink hover:text-white transition-all duration-200"
          >
            SIGN IN
          </Link>
          <Link
            to="/register"
            className="px-10 py-4 bg-ink text-white rounded-2xl text-base font-bold tracking-wider
                       hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          >
            GET STARTED
          </Link>
        </div>
      )}
    </div>
  );
}
