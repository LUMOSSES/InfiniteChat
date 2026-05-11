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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
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
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email, password, code);
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
          <p className="text-ink-lighter mt-2 text-base">Create your account</p>
        </div>

        <div className="bg-white border-2 border-ink rounded-3xl p-10">
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

            <div>
              <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter
                           focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base"
              />
            </div>

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
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-lighter mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity">
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
