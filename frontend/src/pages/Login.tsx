import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import type { AxiosError } from 'axios';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as AxiosError<{ msg?: string }>;
    return axiosErr.response?.data?.msg || axiosErr.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
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
    <div className="min-h-[90vh] flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-ink tracking-tight">InfiniteChat</h1>
          <p className="text-ink-lighter mt-2 text-base">Sign in to continue</p>
        </div>

        <div className="bg-white border-2 border-ink rounded-3xl p-10 shadow-none">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-0 border-2 border-ink rounded-xl overflow-hidden mb-8">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
                mode === 'password'
                  ? 'bg-ink text-white'
                  : 'bg-white text-ink-light hover:bg-cream'
              }`}
            >
              PASSWORD
            </button>
            <button
              type="button"
              onClick={() => setMode('code')}
              className={`py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
                mode === 'code'
                  ? 'bg-ink text-white'
                  : 'bg-white text-ink-light hover:bg-cream'
              }`}
            >
              VERIFY CODE
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter
                           focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base"
              />
            </div>

            {mode === 'password' ? (
              <div>
                <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter
                             focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">
                  VERIFICATION CODE
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    className="flex-1 px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter
                               focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="px-5 py-3.5 rounded-xl border-2 border-ink text-ink text-sm font-semibold tracking-wide
                               hover:bg-ink hover:text-white transition-all duration-200 disabled:opacity-40 whitespace-nowrap"
                  >
                    {codeSent ? 'RESEND' : 'SEND CODE'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-ink text-white rounded-xl font-bold text-base tracking-wider
                         hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
            >
              {loading ? 'PLEASE WAIT...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-lighter mt-8 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-ink font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity">
            Create one &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
