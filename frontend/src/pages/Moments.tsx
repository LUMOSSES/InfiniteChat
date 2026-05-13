import { useState, useEffect, useCallback } from 'react';
import { momentApi } from '../api/moment';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import { Camera, Heart, MessageCircle, Trash2, Loader2, Send } from 'lucide-react';
import type { Moment, MomentComment } from '../types';

export default function Moments() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<string, MomentComment[]>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  const loadMoments = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try { const r = await momentApi.getList(user.userId, 1, 20); if (r.data.data) setMoments(r.data.data); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, [user?.userId]);

  useEffect(() => { loadMoments(); }, [loadMoments]);

  const handlePost = async () => {
    if (!text.trim() || !user?.userId) return;
    setPosting(true); setError('');
    try { await momentApi.create({ userId: user.userId, text: text.trim() }); setText(''); loadMoments(); }
    catch { setError('Failed to post'); }
    finally { setPosting(false); }
  };

  const handleLike = async (momentId: string, liked: boolean) => {
    if (!user?.userId) return;
    try {
      if (liked) await momentApi.unlike(momentId, user.userId); else await momentApi.like(momentId, user.userId);
      setMoments((p) => p.map((m) => m.momentId === momentId ? { ...m, liked: !liked, likeCount: (m.likeCount||0)+(liked?-1:1) } : m));
    } catch { /* ignore */ }
  };

  const loadComments = async (momentId: string) => {
    setLoadingComments(true);
    try {
      const r = await momentApi.getComments(momentId, 1, 50);
      if (r.data.data) setComments((p) => ({ ...p, [momentId]: r.data.data! }));
    } catch { /* ignore */ }
    finally { setLoadingComments(false); }
  };

  const handleComment = async (momentId: string) => {
    if (!commentText.trim() || !user?.userId) return;
    try {
      await momentApi.addComment(momentId, user.userId, commentText.trim());
      setCommentText('');
      setMoments((p) => p.map((m) => m.momentId === momentId ? { ...m, commentCount: (m.commentCount || 0) + 1 } : m));
      await loadComments(momentId);
    } catch { /* ignore */ }
  };

  return (
    <div className="py-6 md:py-10" style={{ width: '100%', maxWidth: '768px', margin: '0 auto', padding: '0 16px' }}>
        <h1 className="text-2xl font-bold text-text mb-6">Moments</h1>

        {/* Compose */}
        <div className="bg-surface rounded-2xl shadow-card p-5 mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
          />
          <div className="flex justify-between items-center mt-3">
            <span className={`text-xs font-medium tabular-nums ${text.length > 2048 ? 'text-error' : 'text-text-muted'}`}>
              {text.length} / 2048
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {posting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error-bg border border-error/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl shadow-card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-bg-alt" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-bg-alt rounded" />
                    <div className="w-16 h-2.5 bg-bg-alt rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-bg-alt rounded" />
                  <div className="w-3/4 h-3 bg-bg-alt rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-bg-alt flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-text-secondary font-medium">No moments yet</p>
            <p className="text-text-muted text-sm mt-1">Post the first moment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {moments.map((m) => (
              <div key={m.momentId} className="bg-surface rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar src={m.user?.avatar} name={m.user?.userName} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-text">{m.user?.userName || 'Unknown'}</p>
                    <p className="text-xs text-text-muted">{m.createTime}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-text mb-4 leading-relaxed">{m.text}</p>
                {m.mediaUrl && (
                  <img
                    src={m.mediaUrl}
                    alt=""
                    className="rounded-xl max-h-80 w-full object-cover mb-4"
                    loading="lazy"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center gap-5 pt-3 border-t border-border">
                  <button
                    onClick={() => handleLike(m.momentId, !!m.liked)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      m.liked ? 'text-error' : 'text-text-muted hover:text-error'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${m.liked ? 'fill-error' : ''}`} />
                    {m.likeCount || 0}
                  </button>
                  <button
                    onClick={() => {
                      const next = commentingId === m.momentId ? null : m.momentId;
                      setCommentingId(next);
                      setCommentText('');
                      if (next) loadComments(next);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${commentingId === m.momentId ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {m.commentCount || 0}
                  </button>
                  {user?.userId === m.userId && (
                  <button
                    onClick={() => { if (user?.userId) momentApi.deleteMoment(m.momentId, user.userId).then(loadMoments); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-error transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  )}
                </div>
                {commentingId === m.momentId && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(m.momentId)}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        autoFocus
                      />
                      <button
                        onClick={() => handleComment(m.momentId)}
                        disabled={!commentText.trim()}
                        className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark disabled:opacity-40 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Comments list */}
                    {loadingComments && (
                      <div className="flex justify-center py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                      </div>
                    )}
                    {comments[m.momentId]?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {comments[m.momentId].map((c) => (
                          <div key={c.commentId} className="flex gap-2 pl-1">
                            <UserAvatar name={c.userName} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="bg-bg rounded-lg px-3 py-2">
                                <p className="text-xs font-semibold text-primary">{c.userName}</p>
                                {c.parentUserName && (
                                  <span className="text-xs text-text-muted">Reply @{c.parentUserName}: </span>
                                )}
                                <p className="text-xs text-text mt-0.5">{c.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!loadingComments && comments[m.momentId]?.length === 0 && (
                      <p className="text-xs text-text-muted text-center py-3">No comments yet</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
