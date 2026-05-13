import { useState, type FormEvent } from 'react';
import { Monitor, FileText, Copy, Loader2, Sparkles, ArrowRight, Check } from 'lucide-react';

const STYLE_PRESETS = ['Minimalist','Brutalist','Retro Cream','Dark Mode','Cyberpunk','Glassmorphism','Swiss Style'];

export default function Generator() {
  const [scenario, setScenario] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [style, setStyle] = useState('Minimalist');
  const [customStyle, setCustomStyle] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) { setError('Please fill in the scenario field.'); return; }
    setError(''); setLoading(true); setResult(''); setCopied(false);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const s = customStyle.trim() || style;
      setResult(`## Message Template\n\n**Context:** ${scenario.trim()}\n\n**Goal:** ${userGoal.trim()||'General communication'}\n\n**Style:** ${s}\n\n---\n\n### Chat Bubble (Sender)\n\`\`\`\n+-------------------------------------------+\n|  Hey! Welcome to the team!               |\n|  Let's collaborate on this project.      |\n+-------------------------------------------+\n\`\`\`\n\n### Chat Bubble (Receiver)\n\`\`\`\n+-------------------------------------------+\n|  Thanks! I'm ready to start.             |\n|  What are our top priorities?            |\n+-------------------------------------------+\n\`\`\`\n\n### Notification Template\n> **[App Name]** — New message from *Sender*\n\n### System Message\n> System notification in **${s.toLowerCase()}** style.\n\n---\n\n*Generated with InfiniteChat — ready to ship.*`);
    } catch { setError('Failed to generate template.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-6 md:py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text">Template Generator</h1>
        <p className="text-text-secondary text-sm mt-1.5">Design message templates for any scenario</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 justify-center">
        {/* Left: Form */}
        <div className="flex-1 max-w-lg">
          <div className="bg-surface rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-text">Design Brief</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Scenario */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  1. Scenario / Context
                </label>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="e.g. A messaging app for team collaboration, supporting real-time chat and file sharing..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* User Goal */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  2. User goal (optional)
                </label>
                <textarea
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  placeholder="e.g. Help users organize group chats with tags, read receipts..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  3. Visual style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNyIgdmlld0JveD0iMCAwIDEyIDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiM5NEEzQjgiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
                >
                  {STYLE_PRESETS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="Or write your own style description..."
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-error-bg border border-error/20 rounded-xl px-4 py-3">
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm
                           hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Message Template
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex-1 max-w-lg">
          <div className="bg-surface rounded-2xl shadow-card p-6 h-full flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-text">Generated Template</h2>
            </div>

            <div className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-text-muted font-medium">Generating template...</p>
                </div>
              ) : !result ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-bg-alt flex items-center justify-center">
                    <FileText className="w-7 h-7 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted text-center max-w-xs leading-relaxed">
                    Fill in the details on the left and click generate to see your message template here.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <pre className="text-sm text-text font-mono whitespace-pre-wrap leading-relaxed bg-bg rounded-xl p-4">{result}</pre>
                </div>
              )}
            </div>

            {/* Copy button */}
            <div className="pt-4 mt-4 border-t border-border">
              {result && !loading ? (
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(result);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary-bg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              ) : (
                <p className="text-center text-xs font-medium text-text-muted">Ready to use in your chat app</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
