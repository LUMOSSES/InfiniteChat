import { useState, useEffect, useCallback } from 'react';
import { momentApi } from '../api/moment';
import type { Moment } from '../types';

export default function Moments() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const loadMoments = useCallback(async () => {
    setLoading(true);
    try { const r = await momentApi.getList(1, 20); if (r.data.data) setMoments(r.data.data); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMoments(); }, [loadMoments]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true); setError('');
    try { await momentApi.create({ text: text.trim() }); setText(''); loadMoments(); }
    catch { setError('Failed to post'); }
    finally { setPosting(false); }
  };

  const handleLike = async (momentId: string, liked: boolean) => {
    try {
      if (liked) await momentApi.unlike(momentId); else await momentApi.like(momentId);
      setMoments((p) => p.map((m) => m.momentId === momentId ? { ...m, liked: !liked, likeCount: (m.likeCount||0)+(liked?-1:1) } : m));
    } catch { /* ignore */ }
  };

  return (
    <div className="py-10 flex justify-center">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-ink mb-8">Moments</h1>

        <div className="bg-white border-2 border-ink rounded-2xl p-6 mb-8">
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Share something..." rows={4}
            className="w-full px-5 py-4 rounded-xl border-2 border-ink text-base resize-none focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all"/>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs font-bold text-ink-lighter">{text.length}/2048</span>
            <button onClick={handlePost} disabled={posting || !text.trim()}
              className="px-6 py-3 bg-ink text-white rounded-xl text-sm font-bold tracking-wide hover:opacity-90 disabled:opacity-40 transition-all">
              {posting ? 'POSTING...' : 'POST'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 mb-6"><p className="text-red-600 text-sm font-medium">{error}</p></div>}

        {loading ? <p className="text-center text-ink-lighter py-16">Loading...</p> :
         moments.length === 0 ? <p className="text-center text-ink-lighter py-16 text-base">No moments yet. Post the first one!</p> :
         <div className="space-y-5">
           {moments.map((m) => (
             <div key={m.momentId} className="bg-white border-2 border-ink rounded-2xl p-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-sm font-bold shrink-0">
                   {m.user?.userName?.charAt(0)?.toUpperCase()||'?'}
                 </div>
                 <div>
                   <p className="text-sm font-bold">{m.user?.userName||'Unknown'}</p>
                   <p className="text-xs text-ink-lighter">{m.createTime}</p>
                 </div>
               </div>
               <p className="text-base text-ink mb-4 leading-relaxed">{m.text}</p>
               {m.mediaUrl && <img src={m.mediaUrl} alt="" className="rounded-xl max-h-80 object-cover mb-4 border-2 border-ink"/>}
               <div className="flex gap-6 text-sm font-semibold text-ink-lighter">
                 <button onClick={() => handleLike(m.momentId,!!m.liked)}
                   className={`hover:text-ink transition-colors ${m.liked ? 'text-red-500 font-bold':''}`}>
                   {m.liked?'LIKED':'LIKE'} ({m.likeCount||0})
                 </button>
                 <span>COMMENTS ({m.commentCount||0})</span>
                 <button onClick={() => momentApi.deleteMoment(m.momentId).then(loadMoments)}
                   className="hover:text-red-500 transition-colors ml-auto">DELETE</button>
               </div>
             </div>
           ))}
         </div>
        }
      </div>
    </div>
  );
}
