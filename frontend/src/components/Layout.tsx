import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold tracking-wide px-4 py-2 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-ink text-white'
        : 'text-ink-light hover:text-ink hover:bg-cream'
    }`;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <NavLink to="/" className="text-xl font-bold text-ink tracking-tight">
              InfiniteChat
            </NavLink>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/chat" className={linkClass}>Chat</NavLink>
                <NavLink to="/contacts" className={linkClass}>Contacts</NavLink>
                <NavLink to="/moments" className={linkClass}>Moments</NavLink>
                <NavLink to="/generator" className={linkClass}>Generator</NavLink>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-ink" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-bold">
                    {user?.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm font-medium text-ink hidden sm:block">{user?.userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-ink-lighter hover:text-red-500 tracking-wide transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="text-sm font-semibold text-ink px-5 py-2 rounded-xl border-2 border-ink hover:bg-ink hover:text-white transition-all duration-200"
              >
                SIGN IN
              </NavLink>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <nav className="md:hidden flex border-t-2 border-ink">
            {[['/chat','Chat'],['/contacts','Contacts'],['/moments','Moments'],['/generator','Gen']].map(([p, l]) => (
              <NavLink key={p} to={p}
                className={({ isActive }) =>
                  `flex-1 py-3 text-xs font-semibold text-center tracking-wide transition-all ${
                    isActive ? 'text-ink bg-cream border-b-2 border-ink' : 'text-ink-light hover:bg-cream'
                  }`}
              >{l}</NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8">
        <Outlet />
      </main>

      <footer className="py-5 text-center text-xs text-ink-lighter tracking-wider">
        InfiniteChat &copy; {new Date().getFullYear()} &mdash; Built for real connections
      </footer>
    </div>
  );
}
