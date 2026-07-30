import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { messageApi } from '../api/message';
import { offlineApi } from '../api/offline';
import { contactApi } from '../api/contact';
import UserAvatar from '../components/UserAvatar';
import { Send, MessageCircle, AlertCircle, UserPlus, ChevronLeft } from 'lucide-react';
import type { ContactUser, Message } from '../types';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { connected, lastMessage } = useWebSocket(token || '', user?.userId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState<ContactUser[]>([]);
  const [activeChat, setActiveChat] = useState<ContactUser | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendOnline, setFriendOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.userId) return;
    contactApi.getFriendList(user.userId).then((res) => {
      if (res.data.data) setFriends(res.data.data);
    }).catch(() => {}).finally(() => setFriendsLoading(false));
  }, [user?.userId]);

  useEffect(() => {
    offlineApi.getOfflineMessages(user?.userId).then((res) => {
      const data = res.data.data;
      if (data?.offlineMessages) {
        const offlineMsgs: Message[] = [];
        for (const group of data.offlineMessages) {
          for (const detail of group.offlineMessageDetails) {
            offlineMsgs.push({
              messageId: detail.messageId,
              senderId: detail.sendUserId,
              sessionId: group.sessionId,
              type: detail.type,
              content: detail.offlineMessageBody?.content,
              replyId: detail.offlineMessageBody?.replyId,
              sessionType: group.sessionType,
              createdAt: detail.offlineMessageBody?.createdAt,
            });
          }
        }
        setMessages((prev) => [...offlineMsgs, ...prev]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (lastMessage) {
      const raw = lastMessage.data as Record<string, unknown>;
      const body = raw.body;
      let content: string;
      if (typeof body === 'object' && body !== null) {
        content = (body as Record<string, unknown>).content as string || '';
      } else if (typeof body === 'string') {
        content = body;
      } else {
        content = (raw.content as string) || '';
      }
      const msg: Message = {
        messageId: (raw.messageId || Date.now()) as string,
        senderId: (raw.sendUserId || raw.senderId) as string,
        sessionId: raw.sessionId as string,
        type: raw.type as number,
        content,
        sessionType: raw.sessionType as number,
        createdAt: (raw.createdAt || new Date().toISOString()) as string,
      };
      if (msg.messageId && msg.content) setMessages((prev) => [...prev, msg]);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (!activeChat?.userId) { setFriendOnline(false); return; }
    const check = () => {
      messageApi.checkOnline(activeChat.userId).then((r) => {
        setFriendOnline(r.data.data?.online || false);
      }).catch(() => {});
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [activeChat?.userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    const optimisticMsg: Message = {
      messageId: Date.now().toString(), senderId: user?.userId || '', sessionId: sessionId || '',
      type: 1, content, sessionType: 1, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');
    inputRef.current?.focus();
    try {
      await messageApi.sendMessage({
        sessionId: sessionId || '',
        sendUserId: user?.userId || '',
        receiveUserId: activeChat?.userId || '',
        body: content,
        type: 1,
        sessionType: 1,
      });
    } catch {
      setMessages((prev) => prev.map((m) => m.messageId === optimisticMsg.messageId ? { ...m, type: -1 } : m));
    }
  };

  const selectFriend = (f: ContactUser) => {
    setActiveChat(f);
    setSessionId(f.sessionId || f.userId);
  };

  return (
    <div className="flex gap-0 md:gap-0 py-0 md:py-0 h-[calc(100vh-4rem)]" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Sidebar */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-68 shrink-0 bg-white overflow-hidden flex-col border-r border-gray-200`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Messages</h2>
            <span className={`flex items-center gap-1.5 text-xs ${connected ? 'text-green-500' : 'text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ background: '#FAFAFA' }}>
          {friendsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">No friends yet</p>
              <p className="text-xs mt-1 mb-4 text-center">Add friends from Contacts</p>
              <button
                onClick={() => navigate('/contacts')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Go to Contacts
              </button>
            </div>
          ) : (
            friends.map((f) => {
              const isActive = activeChat?.userId === f.userId;
              return (
                <button
                  key={f.userId}
                  onClick={() => selectFriend(f)}
                  className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive ? 'bg-primary-bg' : 'hover:bg-gray-100'
                  }`}
                >
                  <UserAvatar src={f.avatar} name={f.userName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'font-semibold text-primary' : 'font-medium text-gray-900'}`}>{f.userName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">Click to chat</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3 shrink-0 bg-white">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="relative shrink-0">
                <UserAvatar src={activeChat.avatar} name={activeChat.userName} size="md" />
                {friendOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{activeChat.userName}</p>
                <p className={`text-xs ${friendOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                  {friendOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages area — QQ style: light gray-blue background */}
            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ background: '#F2F3F7' }}>
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200/60 flex items-center justify-center mx-auto mb-5">
                      <MessageCircle className="w-9 h-9 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Say hello!</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.senderId === user?.userId;
                const isFailed = m.type === -1;
                const prevSender = i > 0 ? messages[i - 1]?.senderId : null;
                const sameAsPrev = prevSender === m.senderId;

                return (
                  <div key={m.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAsPrev ? 'mt-1' : 'mt-5'}`}>
                    <div className={`flex gap-3 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="shrink-0">
                        {sameAsPrev ? (
                          <div className="w-9" />
                        ) : (
                          <UserAvatar
                            src={isMine ? user?.avatar : activeChat.avatar}
                            name={isMine ? (user?.userName || '') : activeChat.userName}
                            size="md"
                          />
                        )}
                      </div>

                      {/* Content column */}
                      <div className={`flex flex-col min-w-0 ${isMine ? 'items-end' : 'items-start'}`}>
                        {/* Bubble */}
                        <div className={`relative px-4 py-2.5 text-sm leading-relaxed break-words ${
                          isFailed
                            ? 'bg-red-50 text-red-500 border border-red-200 rounded-xl'
                            : isMine
                              ? 'bg-[#4F46E5] text-white rounded-xl rounded-tr-sm'
                              : 'bg-white text-gray-900 rounded-xl rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        }`}>
                          {isFailed ? (
                            <span className="flex items-center gap-1.5 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              Send failed
                            </span>
                          ) : (
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          )}
                        </div>
                        {/* Timestamp */}
                        {!sameAsPrev && (
                          <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(m.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-200 flex gap-3 items-center bg-white shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center" style={{ background: '#F2F3F7' }}>
            <div className="text-center px-6 max-w-sm">
              <div className="w-24 h-24 rounded-full bg-gray-200/50 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Your Messages</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select a conversation from the left to start chatting.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">{connected ? 'You\'re online' : 'Connecting...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
