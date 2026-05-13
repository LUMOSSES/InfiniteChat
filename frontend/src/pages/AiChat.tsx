import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Bot, User, Send, Loader2, Plus, Trash2, MessageCircle } from 'lucide-react';
import { aiApi } from '../api/ai';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

function loadSessions(): number[] {
  try {
    const raw = localStorage.getItem('ai_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: number[]) {
  localStorage.setItem('ai_sessions', JSON.stringify(sessions));
}

export default function AiChat() {
  const [sessions, setSessions] = useState<number[]>(loadSessions);
  const [activeSession, setActiveSession] = useState<number | null>(
    sessions.length > 0 ? sessions[0] : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const createSession = () => {
    const newId = Date.now();
    const updated = [newId, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    setActiveSession(newId);
    setMessages([]);
    setStreamingText('');
  };

  const deleteSession = (id: number) => {
    const updated = sessions.filter((s) => s !== id);
    setSessions(updated);
    saveSessions(updated);
    if (activeSession === id) {
      setActiveSession(updated.length > 0 ? updated[0] : null);
      setMessages([]);
      setStreamingText('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || streaming || activeSession === null) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setStreaming(true);
    setStreamingText('');

    try {
      const response = await aiApi.streamChat({
        sessionId: activeSession,
        prompt,
      });

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'ai', content: `[请求失败: ${response.status}]` }]);
        setStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE 数据行: "data: xxx\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const text = line.slice(5).trim();
            if (text && text !== '[DONE]') {
              full += text;
              setStreamingText(full);
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'ai', content: full }]);
      setStreamingText('');
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: '[网络错误，请重试]' }]);
      setStreamingText('');
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0">
      {/* Session sidebar */}
      <div className="w-56 shrink-0 border-r border-border bg-surface hidden md:flex flex-col">
        <button
          onClick={createSession}
          className="flex items-center gap-2 mx-3 mt-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {sessions.map((s) => (
            <div
              key={s}
              onClick={() => setActiveSession(s)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
                activeSession === s
                  ? 'bg-primary-bg text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <span className="truncate">
                Chat {new Date(s).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-error-bg text-text-muted hover:text-error transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile session bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-border bg-surface overflow-x-auto">
          <button
            onClick={createSession}
            className="shrink-0 p-2 rounded-xl bg-primary text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
          {sessions.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSession(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSession === s
                  ? 'bg-primary text-white'
                  : 'bg-bg-alt text-text-secondary'
              }`}
            >
              #{new Date(s).toLocaleDateString()}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {activeSession === null ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary-bg flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-text mb-2">千言 AI 助手</h2>
                <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                  我是千言的智能助手，可以回答关于项目的问题、帮助生成消息模板、或进行一般对话。
                </p>
              </div>
              <button
                onClick={createSession}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                开始新对话
              </button>
            </div>
          ) : messages.length === 0 && !streamingText ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Bot className="w-12 h-12 text-text-muted" />
              <p className="text-sm text-text-secondary">开始和 AI 助手对话吧</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-surface border border-border text-text rounded-bl-md'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-bg-alt flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-text-secondary" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming message */}
              {streamingText && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-surface border border-border text-text rounded-bl-md">
                    <pre className="whitespace-pre-wrap font-sans">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 bg-primary rounded-sm ml-0.5 animate-pulse align-middle" />
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        {activeSession !== null && (
          <div className="px-4 py-4 border-t border-border bg-surface">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息，Enter 发送..."
                rows={1}
                disabled={streaming}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark active:scale-[0.96] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {streaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
