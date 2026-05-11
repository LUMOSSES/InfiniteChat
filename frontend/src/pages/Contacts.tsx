import { useState, useEffect, useCallback } from 'react';
import { contactApi } from '../api/contact';
import type { ContactUser, FriendApplication } from '../types';

export default function Contacts() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<ContactUser[]>([]);
  const [requests, setRequests] = useState<FriendApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFriends = useCallback(async () => {
    try { setLoading(true); const r = await contactApi.getFriendList(); if (r.data.data) setFriends(r.data.data); }
    catch { setError('Failed to load friends'); }
    finally { setLoading(false); }
  }, []);

  const loadRequests = useCallback(async () => {
    try { const r = await contactApi.getApplyList(); if (r.data.data) setRequests(r.data.data); }
    catch { /* ignore */ }
  }, []);

  useEffect(() => { loadFriends(); loadRequests(); }, [loadFriends, loadRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try { setLoading(true); const r = await contactApi.searchUser(searchQuery.trim()); if (r.data.data) setSearchResults(r.data.data); }
    catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleAddFriend = async (targetId: string) => {
    try { await contactApi.addFriend(targetId, "Hi! Let's connect."); setSearchQuery(''); setSearchResults([]); loadRequests(); }
    catch { setError('Failed to send request'); }
  };

  const handleAccept = async (applyId: string) => {
    try { await contactApi.acceptApply(applyId); loadRequests(); loadFriends(); }
    catch { setError('Failed to accept'); }
  };

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold text-ink mb-8">Contacts</h1>

      {/* Search */}
      <div className="flex gap-3 mb-8 max-w-xl">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search user by name or email..."
          className="flex-1 px-5 py-3.5 rounded-xl border-2 border-ink bg-white text-base focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all"/>
        <button onClick={handleSearch} disabled={loading}
          className="px-6 py-3.5 bg-ink text-white rounded-xl text-sm font-bold tracking-wide hover:opacity-90 disabled:opacity-40 transition-all">
          SEARCH
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-8 space-y-2 max-w-xl">
          <p className="text-xs font-bold text-ink-light tracking-wider mb-3">SEARCH RESULTS</p>
          {searchResults.map((u) => (
            <div key={u.userId} className="flex items-center justify-between bg-white border-2 border-ink rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-sm font-bold shrink-0">
                  {u.userName?.charAt(0)?.toUpperCase()}
                </div>
                <span className="font-semibold">{u.userName}</span>
              </div>
              <button onClick={() => handleAddFriend(u.userId)}
                className="px-4 py-2 border-2 border-ink rounded-lg text-xs font-bold tracking-wide hover:bg-ink hover:text-white transition-all">
                ADD
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b-2 border-ink mb-6">
        {(['friends', 'requests'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-all ${
              activeTab === tab ? 'text-ink border-b-4 border-ink -mb-0.5' : 'text-ink-lighter hover:text-ink'
            }`}>
            {tab === 'friends' ? `Friends (${friends.length})` : `Requests (${requests.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 mb-4 max-w-xl">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Lists */}
      <div className="max-w-xl">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <p className="text-ink-lighter text-center py-16 text-base">No friends yet. Search and add someone!</p>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div key={f.userId} className="flex items-center gap-4 bg-white border-2 border-ink rounded-xl px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-sm font-bold shrink-0">
                    {f.userName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="font-semibold">{f.userName}</span>
                </div>
              ))}
            </div>
          )
        ) : (
          requests.length === 0 ? (
            <p className="text-ink-lighter text-center py-16 text-base">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-white border-2 border-ink rounded-xl px-5 py-4">
                  <span className="font-medium text-sm">Request #{r.id.slice(-6)}</span>
                  {r.status === 0 && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(r.id)}
                        className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-bold hover:opacity-90">ACCEPT</button>
                      <button onClick={() => contactApi.rejectApply(r.id)}
                        className="px-4 py-2 border-2 border-ink rounded-lg text-xs font-bold hover:bg-cream">REJECT</button>
                    </div>
                  )}
                  {r.status === 1 && <span className="text-xs font-bold text-green-600">ACCEPTED</span>}
                  {r.status === 2 && <span className="text-xs font-bold text-ink-lighter">REJECTED</span>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
