import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import { Mail, Lock, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import type { AxiosError } from 'axios';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as AxiosError<{ msg?: string; code?: number }>;
    const body = axiosErr.response?.data;
    if (body?.msg) return body.msg;
    if (body?.code) return `Error ${body.code}`;
    return axiosErr.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

/* Floating background orbs — subtle decoration */
function BgOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[20%] right-[8%] w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[60%] left-[60%] w-48 h-48 rounded-full bg-indigo-400/5 blur-3xl" />
    </div>
  );
}

export default function Login() {
  const { login, loginCode } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'password' | 'code'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    try {
      setLoading(true);
      setError('');
      await authApi.sendEmailCode(email);
      setCodeSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'password') {
        await login(email, password);
      } else {
        await loginCode(email, code);
      }
      navigate('/chat');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BgOrbs />
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-text tracking-tight">Threadora</span>
            </Link>
            <h1 className="text-2xl font-bold text-text">Welcome back</h1>
            <p className="text-text-secondary mt-1.5 text-sm">Sign in to continue</p>
          </div>

          {/* Card */}
          <div className="bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6 sm:p-8">
            {/* Mode tabs */}
            <div className="flex border-b border-border mb-6">
              <button
                type="button"
                onClick={() => { setMode('password'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                  mode === 'password'
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                Password login
              </button>
              <button
                type="button"
                onClick={() => { setMode('code'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                  mode === 'code'
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                Code login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email — icon OUTSIDE input */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Email address
                </label>
                <div className="flex items-center border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <span className="pl-4 pr-2 text-text-muted shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password field */}
              {mode === 'password' && (
                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <span className="pl-4 pr-2 text-text-muted shrink-0">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              )}

              {/* Code field */}
              {mode === 'code' && (
                <div>
                  <label htmlFor="login-code" className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Verification code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="login-code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      required
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="6-digit code"
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading}
                      className="shrink-0 px-4 py-3 rounded-xl bg-primary-bg text-primary text-sm font-semibold
                                 hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {codeSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-error-bg border border-error/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm
                           hover:bg-primary-dark hover:shadow-elevated active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-text-muted mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Create one &rarr;
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
