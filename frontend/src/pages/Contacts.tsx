import { useState, useEffect, useCallback } from 'react';
import { contactApi } from '../api/contact';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import { Search, UserPlus, Users, UserCheck, Clock, Check, X, Loader2 } from 'lucide-react';
import type { ContactUser, FriendApplication } from '../types';

export default function Contacts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<ContactUser[]>([]);
  const [requests, setRequests] = useState<FriendApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFriends = useCallback(async () => {
    if (!user?.userId) return;
    try { setLoading(true); const r = await contactApi.getFriendList(user.userId); if (r.data.data) setFriends(r.data.data); }
    catch { setError('Failed to load friends'); }
    finally { setLoading(false); }
  }, [user?.userId]);

  const loadRequests = useCallback(async () => {
    if (!user?.userId) return;
    try { const r = await contactApi.getApplyList(user.userId); if (r.data.data) setRequests(r.data.data); }
    catch { /* ignore */ }
  }, [user?.userId]);

  useEffect(() => { loadFriends(); loadRequests(); }, [loadFriends, loadRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.userId) return;
    try { setLoading(true); setError(''); const r = await contactApi.searchUser(user.userId, searchQuery.trim()); if (r.data.data) setSearchResults(r.data.data); }
    catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleAddFriend = async (targetId: string) => {
    if (!user?.userId) return;
    try { await contactApi.addFriend(user.userId, targetId, "Hi! Let's connect."); setSearchQuery(''); setSearchResults([]); loadRequests(); }
    catch { setError('Failed to send request'); }
  };

  const handleAccept = async (applyId: string) => {
    if (!user?.userId) return;
    try { await contactApi.acceptApply(user.userId, applyId); loadRequests(); loadFriends(); }
    catch { setError('Failed to accept'); }
  };

  return (
    <div style={{ width: '100%', maxWidth: '768px', margin: '0 auto', padding: '12vh 16px 0 16px' }}>
      <h1 className="text-2xl font-bold text-text mb-6">Contacts</h1>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex items-center flex-1 border border-border rounded-xl bg-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <span className="pl-4 pr-2 text-text-muted shrink-0">
            <Search className="w-4 h-4" />
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or email..."
            className="flex-1 py-3 pr-4 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Search Results</p>
          <div className="space-y-2">
            {searchResults.map((u) => (
              <div key={u.userId} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3 shadow-card">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar src={u.avatar} name={u.userName} size="lg" />
                  <span className="font-medium text-sm text-text truncate">{u.userName}</span>
                </div>
                <button
                  onClick={() => handleAddFriend(u.userId)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-bg text-primary rounded-lg text-xs font-semibold hover:bg-primary/10 transition-all shrink-0 ml-3"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-2 pb-3 px-1 mr-6 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'friends'
              ? 'text-primary border-primary'
              : 'text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          <Users className="w-4 h-4" />
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'requests'
              ? 'text-primary border-primary'
              : 'text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          <Clock className="w-4 h-4" />
          Requests ({requests.length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-error-bg border border-error/20 rounded-xl px-4 py-3 mb-4">
          <span className="text-error text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Lists */}
      {activeTab === 'friends' ? (
        friends.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-bg-alt flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-text-secondary font-medium">No friends yet</p>
            <p className="text-text-muted text-sm mt-1 mb-4">Search and add someone to get started</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {friends.map((f) => (
              <div key={f.userId} className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3 shadow-card hover:shadow-card-hover transition-all">
                <UserAvatar src={f.avatar} name={f.userName} size="lg" />
                <span className="font-medium text-sm text-text truncate">{f.userName}</span>
              </div>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-bg-alt flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-text-secondary font-medium">No pending requests</p>
            <p className="text-text-muted text-sm mt-1">Friend requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3 shadow-card">
                <span className="font-medium text-sm text-text truncate mr-3">Request #{r.id.slice(-6)}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 0 && (
                    <>
                      <button
                        onClick={() => handleAccept(r.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg text-xs font-semibold hover:bg-success/90 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        Accept
                      </button>
                      <button
                        onClick={() => { if (user?.userId) contactApi.rejectApply(user.userId, r.id); }}
                        className="flex items-center gap-1 px-3 py-1.5 border border-border text-text-secondary rounded-lg text-xs font-semibold hover:bg-surface-hover transition-all"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === 1 && <span className="text-xs font-semibold text-success bg-success-bg px-3 py-1.5 rounded-lg">Accepted</span>}
                  {r.status === 2 && <span className="text-xs font-semibold text-text-muted bg-bg-alt px-3 py-1.5 rounded-lg">Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
