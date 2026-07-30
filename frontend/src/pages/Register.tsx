import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import { Mail, Lock, Key, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
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

function BgOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-[10%] right-[12%] w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[15%] left-[6%] w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[55%] left-[55%] w-48 h-48 rounded-full bg-indigo-400/5 blur-3xl" />
    </div>
  );
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
            <h1 className="text-2xl font-bold text-text">Create account</h1>
            <p className="text-text-secondary mt-1.5 text-sm">Join Threadora and start connecting</p>
          </div>

          {/* Card */}
          <div className="bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Email address
                </label>
                <div className="flex items-center border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <span className="pl-4 pr-2 text-text-muted shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Password
                </label>
                <div className="flex items-center border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <span className="pl-4 pr-2 text-text-muted shrink-0">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              {/* Code */}
              <div>
                <label htmlFor="reg-code" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Verification code
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center flex-1 border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <span className="pl-4 pr-2 text-text-muted shrink-0">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      required
                      className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
                      placeholder="6-digit code"
                    />
                  </div>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-text-muted mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Sign in &rarr;
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
