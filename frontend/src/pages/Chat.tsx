import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { messageApi } from '../api/message';
import { offlineApi } from '../api/offline';
import { contactApi } from '../api/contact';
import type { ContactUser, Message } from '../types';

export default function Chat() {
  const { user, token } = useAuth();
  const { connected, lastMessage } = useWebSocket(token || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState<ContactUser[]>([]);
  const [activeChat, setActiveChat] = useState<ContactUser | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contactApi.getFriendList().then((res) => {
      if (res.data.data) setFriends(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    offlineApi.getOfflineMessages().then((res) => {
      if (res.data.data) setMessages((prev) => [...prev, ...res.data.data!]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (lastMessage) {
      const msg = lastMessage.data as Message;
      if (msg?.messageId) setMessages((prev) => [...prev, msg]);
    }
  }, [lastMessage]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const optimisticMsg: Message = {
      messageId: Date.now().toString(), senderId: user?.userId || '', sessionId: sessionId || '',
      type: 1, content: input.trim(), sessionType: 1, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');
    try {
      await messageApi.sendMessage({ sessionId: sessionId!, content: optimisticMsg.content!, type: 1, sessionType: 1 });
    } catch {
      setMessages((prev) => prev.map((m) => m.messageId === optimisticMsg.messageId ? { ...m, type: -1 } : m));
    }
  };

  return (
    <div className="flex gap-6 py-6 h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-white border-2 border-ink rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b-2 border-ink">
          <h2 className="text-base font-bold text-ink tracking-wide">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="text-sm text-ink-lighter p-5 text-center">No friends yet</p>
          ) : (
            friends.map((f) => (
              <button key={f.userId}
                onClick={() => { setActiveChat(f); setSessionId(f.userId); }}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors
                  ${activeChat?.userId === f.userId ? 'bg-cream' : 'hover:bg-cream/50'}`}>
                <div className="w-9 h-9 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-xs font-bold shrink-0">
                  {f.userName?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold truncate">{f.userName}</span>
              </button>
            ))
          )}
        </div>
        <div className="p-4 border-t-2 border-ink text-center">
          <span className={`text-xs font-bold tracking-wide ${connected ? 'text-green-600' : 'text-ink-lighter'}`}>
            {connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Chat area — fills remaining space symmetrically */}
      <div className="flex-1 bg-white border-2 border-ink rounded-2xl overflow-hidden flex flex-col">
        {activeChat ? (
          <>
            <div className="px-5 py-4 border-b-2 border-ink flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-xs font-bold shrink-0">
                {activeChat.userName?.charAt(0)?.toUpperCase()}
              </div>
              <span className="font-bold">{activeChat.userName}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div key={m.messageId} className={`flex ${m.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[60%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.type === -1 ? 'bg-red-50 text-red-500 border-2 border-red-300' :
                    m.senderId === user?.userId ? 'bg-ink text-white' : 'bg-cream text-ink border-2 border-ink'
                  }`}>{m.type === -1 ? 'Send failed' : m.content}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-5 border-t-2 border-ink flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3 rounded-xl border-2 border-ink text-base focus:outline-none focus:ring-4 focus:ring-ink/10 transition-all"/>
              <button type="submit" disabled={!input.trim()}
                className="px-6 py-3 bg-ink text-white rounded-xl text-sm font-bold tracking-wide hover:opacity-90 disabled:opacity-40 transition-all">
                SEND
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1" strokeLinecap="round" className="mx-auto mb-4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-ink-lighter text-base">Select a friend to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
