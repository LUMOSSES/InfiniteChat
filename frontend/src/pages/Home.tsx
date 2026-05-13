import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, Users, Camera, Zap, ArrowRight } from 'lucide-react';

const features = [
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant messaging with WebSocket — no delays, always connected.' },
  { icon: Users, title: 'Contact Management', desc: 'Search, add friends, manage groups — your social graph, organized.' },
  { icon: Camera, title: 'Moments Feed', desc: 'Share updates, like and comment — stay connected with your circle.' },
  { icon: Zap, title: 'Message Templates', desc: 'Generate beautiful message templates for any scenario or style.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-bg text-primary text-sm font-medium">
            <Zap className="w-3.5 h-3.5" />
            Real-time messaging, redefined
          </span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-text tracking-tight mb-6" style={{ lineHeight: 1.1 }}>
            Chat without
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-indigo-400 bg-clip-text text-transparent">
              boundaries
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed" style={{ maxWidth: '576px', margin: '0 auto 40px' }}>
            Real-time messaging, moments sharing, and beautiful message templates — all in one place, designed for real connections.
          </p>

          {/* CTAs */}
          {isAuthenticated ? (
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-base font-semibold
                         hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
            >
              Open Chat
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="px-8 py-4 bg-primary text-white rounded-2xl text-base font-semibold
                           hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border border-border text-text-secondary rounded-2xl text-base font-semibold
                           hover:bg-surface hover:text-text hover:border-text-muted transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-surface rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-text mb-1.5">{title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
