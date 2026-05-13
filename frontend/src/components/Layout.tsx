import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { MessageCircle, Users, Camera, Wand2, Bot, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/moments', label: 'Moments', icon: Camera },
  { to: '/ai', label: 'AI Assistant', icon: Bot },
  { to: '/generator', label: 'Generator', icon: Wand2 },
];

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-text-secondary hover:text-text hover:bg-surface-hover'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-[10px] font-medium transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-text-muted'
    }`;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-text tracking-tight hidden sm:block">
                InfiniteChat
              </span>
            </NavLink>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          {/* Right: User + Logout */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <UserAvatar src={user?.avatar} name={user?.userName} size="sm" />
                <span className="text-sm font-medium text-text hidden sm:block">{user?.userName}</span>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-error transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark px-5 py-2 rounded-xl transition-all duration-200 shadow-sm"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {isAuthenticated && mobileOpen && (
          <nav className="md:hidden border-t border-border bg-surface px-4 py-2 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-primary-bg text-primary' : 'text-text-secondary hover:bg-surface-hover'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-bg w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Mobile bottom nav */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-border">
          <div className="flex justify-around px-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={mobileLinkClass}>
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1 w-full px-4 sm:px-6 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden md:block py-6 text-center text-xs text-text-muted border-t border-border">
        InfiniteChat &copy; {new Date().getFullYear()} &mdash; Built for real connections
      </footer>
    </div>
  );
}
