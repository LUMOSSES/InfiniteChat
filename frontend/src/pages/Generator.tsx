import { useState, type FormEvent } from 'react';

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
    <div className="py-10">
      <h1 className="text-3xl font-bold text-ink mb-8 text-center">Template Generator</h1>

      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        {/* LEFT */}
        <div className="flex-1 max-w-lg">
          <div className="bg-cream border-2 border-ink rounded-2xl p-8">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-8 tracking-wide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
              DESIGN BRIEF
            </h2>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">1. SCENARIO / CONTEXT</label>
                <textarea value={scenario} onChange={(e) => setScenario(e.target.value)}
                  placeholder="e.g. A messaging app for team collaboration, supporting real-time chat and file sharing..."
                  rows={4} className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink tracking-[0.15em] mb-2.5">2. USER GOAL (OPTIONAL)</label>
                <textarea value={userGoal} onChange={(e) => setUserGoal(e.target.value)}
                  placeholder="e.g. Help users organize group chats with tags, read receipts..."
                  rows={3} className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base resize-none"/>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-ink tracking-[0.15em]">3. VISUAL STYLE</label>
                  <button type="button" className="text-xs font-semibold text-ink-light hover:text-ink underline underline-offset-4">Browse Gallery &rarr;</button>
                </div>
                <select value={style} onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink text-base focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iNyIgdmlld0JveD0iMCAwIDEyIDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiMxYTFhMWEiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]">
                  {STYLE_PRESETS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" value={customStyle} onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="Or write your own style description here..."
                  className="w-full mt-2.5 px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-ink placeholder:text-ink-lighter focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all text-base"/>
              </div>
              {error && <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3"><p className="text-red-600 text-sm font-medium">{error}</p></div>}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-ink text-white rounded-xl font-bold text-base tracking-wider hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-3">
                {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32"/></svg> GENERATING...</>
                : <>GENERATE MESSAGE TEMPLATE <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 max-w-lg">
          <div className="bg-cream border-2 border-ink rounded-2xl p-8 h-full flex flex-col min-h-[450px]">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-6 tracking-wide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              GENERATED TEMPLATE
            </h2>
            <div className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <svg className="animate-spin h-8 w-8 text-ink-lighter" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32"/></svg>
                  <p className="text-sm text-ink-lighter font-medium">Generating template...</p>
                </div>
              ) : !result ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  <p className="text-base text-ink-lighter text-center max-w-xs leading-relaxed">Fill in the details on the left and click generate to see your message template here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto"><pre className="text-sm text-ink font-mono whitespace-pre-wrap leading-relaxed">{result}</pre></div>
              )}
            </div>
            <div className="pt-5 mt-5 border-t-2 border-ink">
              {result && !loading ? (
                <button onClick={async()=>{await navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                  className="w-full py-3 border-2 border-ink text-ink rounded-xl text-sm font-bold tracking-wider hover:bg-ink hover:text-white transition-all">
                  {copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
                </button>
              ) : (
                <p className="text-center text-xs font-bold text-ink-lighter tracking-[0.2em]">READY TO USE IN YOUR CHAT APP</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
