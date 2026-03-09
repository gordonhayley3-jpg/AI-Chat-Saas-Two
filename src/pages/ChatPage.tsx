import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, ChevronDown, Check, LogOut, Plus, MessageSquare, Trash2, Edit2, X, Bot, Settings, Search, Brain, Copy, RefreshCw } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { AI_MODELS, DEFAULT_MODEL_ID, PROVIDER_LABELS, type ModelInfo } from '../config/models'
import type { Chat, Message } from '../types'

// Edge function URL
const AI_CHAT_URL = 'https://9a14x0l5--ai-chat.functions.blink.new'

// Provider SVG icons
function ProviderIcon({ provider, size = 16 }: { provider: string; size?: number }) {
  const s = size
  if (provider === 'openai') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.512 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
  if (provider === 'google') return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
  if (provider === 'deepseek') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1B6EF3"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">DS</text>
    </svg>
  )
  if (provider === 'anthropic') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541 12.003 17.37 6.696 3.541H2l7.693 19.918h4.614L22 3.541h-4.696z"/>
    </svg>
  )
  return <Bot size={s} />
}

function mapChat(r: any): Chat {
  return { id: r.id, userId: r.user_id || r.userId, title: r.title, createdAt: r.created_at || r.createdAt, updatedAt: r.updated_at || r.updatedAt }
}

function mapMessage(r: any): Message {
  return { id: r.id, chatId: r.chat_id || r.chatId, userId: r.user_id || r.userId, role: r.role, content: r.content, tokensUsed: Number(r.tokens_used || r.tokensUsed) || 0, createdAt: r.created_at || r.createdAt }
}

// ======= AUTH MODAL =======
function AuthModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div className="modal-content bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg btn-ghost text-[#888]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Войдите, чтобы продолжить</h2>
        <p className="text-sm text-[#888] mb-6 leading-relaxed">
          Для использования чата необходимо войти или зарегистрироваться
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { navigate({ to: '/login' }); onClose() }}
            className="flex-1 py-2.5 rounded-xl border border-[#2a2a2a] text-sm font-medium text-[#ccc] hover:bg-[#212121] transition-all"
          >
            Войти
          </button>
          <button
            onClick={() => { navigate({ to: '/register' }); onClose() }}
            className="flex-1 py-2.5 rounded-xl btn-primary text-sm"
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  )
}

// ======= REASONING BLOCK =======
function ReasoningBlock({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
      >
        <Brain className="w-3.5 h-3.5" />
        <span>{isStreaming ? 'Думаю...' : 'Размышления'}</span>
        {isStreaming && (
          <span className="flex gap-0.5 ml-1">
            <span className="w-1 h-1 bg-indigo-400 rounded-full typing-dot" />
            <span className="w-1 h-1 bg-indigo-400 rounded-full typing-dot" />
            <span className="w-1 h-1 bg-indigo-400 rounded-full typing-dot" />
          </span>
        )}
        <span className="ml-auto text-[#555]">{open ? '▲' : '▼'}</span>
      </button>
      {open && content && (
        <div className="reasoning-block p-4 text-xs text-[#aaa] leading-relaxed font-mono overflow-y-auto max-h-48 custom-scrollbar">
          {content}
        </div>
      )}
    </div>
  )
}

// ======= CODE BLOCK =======
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#111] my-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[10px] font-mono text-[#555] ml-1 uppercase">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[#222]">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{ margin: 0, background: 'transparent', padding: '16px 20px', fontSize: '13px', lineHeight: '1.65', fontFamily: 'var(--font-mono)' }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

// ======= MESSAGE BUBBLE =======
function MessageBubble({ message, userInitial }: { message: Message & { reasoning?: string }; userInitial: string }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 animate-fade-in group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
        isUser ? 'bg-[#212121] text-[#ccc] border border-[#2a2a2a]' : 'bg-indigo-500/20 border border-indigo-500/30'
      }`}>
        {isUser ? userInitial : <Bot className="w-4 h-4 text-indigo-400" />}
      </div>
      <div className={`flex-1 max-w-[85%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="text-[11px] text-[#555] px-1">
          {isUser ? 'Вы' : 'AI'} · {new Date(message.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'message-user text-[#e5e5e5] rounded-tr-sm' : 'text-[#e5e5e5] rounded-tl-sm'
        }`}>
          {message.reasoning && !isUser && (
            <ReasoningBlock content={message.reasoning} isStreaming={false} />
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-code:text-indigo-400 prose-headings:text-white">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    if (match) return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                    return <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono" {...props}>{children}</code>
                  },
                  p({ children }) { return <p className="mb-3 last:mb-0">{children}</p> },
                  ul({ children }) { return <ul className="list-disc ml-4 mb-3 space-y-1.5">{children}</ul> },
                  ol({ children }) { return <ol className="list-decimal ml-4 mb-3 space-y-1.5">{children}</ol> },
                  h1({ children }) { return <h1 className="text-lg font-bold mb-3">{children}</h1> },
                  h2({ children }) { return <h2 className="text-base font-bold mb-2">{children}</h2> },
                  h3({ children }) { return <h3 className="text-sm font-bold mb-2">{children}</h3> },
                  blockquote({ children }) { return <blockquote className="border-l-2 border-indigo-500/40 pl-4 text-[#888] mb-3">{children}</blockquote> },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <button onClick={handleCopy} className="p-1 rounded btn-ghost text-[#555] hover:text-white">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1 rounded btn-ghost text-[#555] hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ======= STREAMING MESSAGE =======
function StreamingMessage({ content, reasoning, isReasoningDone }: { content: string; reasoning: string; isReasoningDone: boolean }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-indigo-500/20 border border-indigo-500/30">
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="flex-1 max-w-[85%] flex flex-col gap-1.5 items-start">
        <div className="text-[11px] text-[#555] px-1">AI · сейчас</div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-[#e5e5e5]">
          {reasoning && (
            <ReasoningBlock content={reasoning} isStreaming={!isReasoningDone} />
          )}
          {content ? (
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-code:text-indigo-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match) return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                  return <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono" {...props}>{children}</code>
                },
                p({ children }) { return <p className="mb-3 last:mb-0 inline">{children}</p> },
              }}>
                {content}
              </ReactMarkdown>
              <span className="typing-cursor" />
            </div>
          ) : !reasoning ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ======= MODEL SELECTOR =======
function ModelSelector({ selected, onChange }: { selected: ModelInfo; onChange: (m: ModelInfo) => void }) {
  const [open, setOpen] = useState(false)
  const textModels = AI_MODELS.filter(m => m.category === 'text')
  const imageModels = AI_MODELS.filter(m => m.category === 'image')

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#1a1a1a] transition-all text-sm"
      >
        <ProviderIcon provider={selected.provider} size={15} />
        <span className="font-medium text-[#e5e5e5] max-w-[120px] truncate">{selected.name}</span>
        {selected.isFree && <span className="badge-free">Free</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-[#666] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            <div className="p-2">
              <div className="px-3 py-2 text-[10px] font-bold text-[#555] uppercase tracking-widest">Текстовые модели</div>
              {textModels.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onChange(m); setOpen(false); toast.success(`Модель: ${m.name}`, { duration: 1500 }) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    selected.id === m.id ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-[#212121] text-[#ccc]'
                  }`}
                >
                  <ProviderIcon provider={m.provider} size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-[#666]">{m.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.isFree ? <span className="badge-free">Free</span> : <span className="badge-premium">Pro</span>}
                    {selected.id === m.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                </button>
              ))}
              {imageModels.length > 0 && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-[#555] uppercase tracking-widest mt-1 border-t border-[#2a2a2a]">Изображения</div>
                  {imageModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { onChange(m); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        selected.id === m.id ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-[#212121] text-[#ccc]'
                      }`}
                    >
                      <ProviderIcon provider={m.provider} size={16} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-[11px] text-[#666]">{m.description}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ======= SIDEBAR =======
function ChatSidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, isOpen, onClose, user, onSignOut }: {
  chats: Chat[]; activeChatId: string | null; onNewChat: () => void; onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void; onRenameChat: (id: string, title: string) => void;
  isOpen: boolean; onClose: () => void; user: any; onSignOut: () => void;
}) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const filtered = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform duration-250 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ width: 240, background: 'hsl(var(--sidebar))' }}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-[15px] text-white">NexusAI</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg btn-ghost text-[#555]"><X className="w-4 h-4" /></button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3 pb-2">
          <button onClick={onNewChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-400 font-medium text-sm transition-all border border-indigo-500/20">
            <Plus className="w-4 h-4" />
            Новый чат
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111] border border-[#222]">
            <Search className="w-3.5 h-3.5 text-[#555]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="flex-1 bg-transparent text-xs text-[#ccc] placeholder:text-[#444] outline-none" />
          </div>
        </div>

        {/* Nav */}
        <div className="px-2 space-y-0.5">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1f1f1f] text-white text-sm font-medium">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Чаты
          </Link>
          <Link to="/bots" className="flex items-center gap-2.5 px-3 py-2 rounded-xl btn-ghost text-[#888] hover:text-white text-sm">
            <Bot className="w-4 h-4" />
            Каталог моделей
          </Link>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
          <div className="px-2 mb-2 text-[10px] font-semibold text-[#444] uppercase tracking-widest">История</div>
          <div className="space-y-0.5">
            {filtered.map(chat => (
              <div key={chat.id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${
                activeChatId === chat.id ? 'bg-[#1f1f1f] text-white' : 'text-[#888] hover:bg-[#161616] hover:text-[#ccc]'
              }`}>
                {editingId === chat.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { onRenameChat(chat.id, editTitle); setEditingId(null) }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 bg-transparent outline-none text-xs text-white"
                    />
                    <button onClick={() => { onRenameChat(chat.id, editTitle); setEditingId(null) }} className="p-1 hover:text-indigo-400"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 hover:text-[#666]"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeChatId === chat.id ? 'text-indigo-400' : 'opacity-40'}`} />
                    <span className="flex-1 truncate text-xs" onClick={() => onSelectChat(chat.id)}>{chat.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button onClick={e => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title) }} className="p-1 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); onDeleteChat(chat.id) }} className="p-1 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-xs text-[#444]">
                {search ? 'Ничего не найдено' : 'Нет чатов'}
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="shrink-0 p-3 border-t border-[#1a1a1a] space-y-1">
          <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl btn-ghost text-[#888] hover:text-white text-sm">
            <Settings className="w-4 h-4" />
            Настройки
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#ccc] truncate">{user?.email || 'Гость'}</div>
            </div>
            {user && (
              <button onClick={onSignOut} className="p-1.5 rounded-lg btn-ghost text-[#555] hover:text-white">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

// ======= CHAT INPUT =======
function ChatInput({ onSend, isLoading, disabled }: { onSend: (text: string) => void; isLoading: boolean; disabled?: boolean }) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.height = 'auto'
    ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + 'px'
  }, [value])

  const submit = () => {
    const t = value.trim()
    if (!t || isLoading || disabled) return
    onSend(t)
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      <div className="chat-input-container">
        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={disabled ? 'Войдите чтобы писать...' : 'Напишите сообщение...'}
          disabled={isLoading || disabled}
          rows={1}
          className="w-full bg-transparent px-5 py-4 text-sm text-[#e5e5e5] placeholder:text-[#444] outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ maxHeight: '180px', minHeight: '52px' }}
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-[11px] text-[#444]">Shift+Enter для новой строки</span>
          <button
            onClick={submit}
            disabled={!value.trim() || isLoading || disabled}
            className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center disabled:opacity-30 disabled:grayscale"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-[#333] mt-2.5">NexusAI может ошибаться. Проверяйте важную информацию.</p>
    </div>
  )
}

// ======= WELCOME SCREEN =======
function WelcomeScreen({ model, onSend }: { model: ModelInfo; onSend: (t: string) => void }) {
  const suggestions = [
    'Объясни квантовые вычисления простыми словами',
    'Напиши план для стартапа по AI',
    'Как улучшить продуктивность программиста?',
    'Составь меню на неделю для правильного питания',
  ]
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-6">
        <Bot className="w-6 h-6 text-indigo-400" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Чем могу помочь?</h1>
      <p className="text-sm text-[#555] mb-10">
        {model.name} · {model.isFree ? 'Бесплатно' : 'Pro'} · {model.description}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSend(s)}
            className="px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] text-left text-sm text-[#aaa] hover:border-indigo-500/30 hover:text-white hover:bg-[#1a1a1a] transition-all card-hover"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ======= MAIN PAGE =======
export default function ChatPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<(Message & { reasoning?: string })[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [streamReasoning, setStreamReasoning] = useState('')
  const [isReasoningDone, setIsReasoningDone] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [guestCount, setGuestCount] = useState(() => Number(localStorage.getItem('guest_msg_count') || 0))
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(() => {
    const saved = localStorage.getItem('selected_model_id')
    return AI_MODELS.find(m => m.id === saved) || AI_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AI_MODELS[0]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (user) loadChats()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  const loadChats = async () => {
    if (!user) return
    try {
      const result = await blink.db.table('chats').list({ where: { user_id: user.id }, orderBy: { updated_at: 'desc' }, limit: 50 }) as any[]
      setChats(result.map(mapChat))
    } catch (err) { console.error(err) }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const result = await blink.db.table('messages').list({ where: { chat_id: chatId }, orderBy: { created_at: 'asc' }, limit: 100 }) as any[]
      setMessages(result.map(mapMessage))
    } catch (err) { console.error(err) }
  }

  const handleNewChat = () => { setActiveChatId(null); setMessages([]); setStreamContent(''); setStreamReasoning('') }
  const handleSelectChat = (id: string) => { setActiveChatId(id); setStreamContent(''); setStreamReasoning(''); loadMessages(id); if (window.innerWidth < 1024) setSidebarOpen(false) }
  const handleDeleteChat = async (id: string) => {
    try { await blink.db.table('chats').delete(id); setChats(p => p.filter(c => c.id !== id)); if (activeChatId === id) handleNewChat(); toast.success('Чат удалён') }
    catch { toast.error('Ошибка удаления') }
  }
  const handleRenameChat = async (id: string, title: string) => {
    try { await blink.db.table('chats').update(id, { title, updated_at: new Date().toISOString() }); setChats(p => p.map(c => c.id === id ? { ...c, title } : c)) }
    catch { toast.error('Ошибка переименования') }
  }

  const handleModelChange = (m: ModelInfo) => {
    setSelectedModel(m)
    localStorage.setItem('selected_model_id', m.id)
  }

  const handleSignOut = async () => { await signOut(); toast.success('Выход выполнен'); navigate({ to: '/login' }) }

  const handleSend = useCallback(async (content: string) => {
    if (isStreaming) return

    // Guest limit check
    if (!user) {
      if (guestCount >= 3) { setShowAuthModal(true); return }
      const newCount = guestCount + 1
      setGuestCount(newCount)
      localStorage.setItem('guest_msg_count', String(newCount))
    }

    const now = new Date().toISOString()
    let currentChatId = activeChatId

    // Create chat if needed (only for authenticated users)
    if (!currentChatId && user) {
      try {
        const title = content.slice(0, 60) + (content.length > 60 ? '...' : '')
        const raw = await blink.db.table('chats').create({ user_id: user.id, title, created_at: now, updated_at: now }) as any
        const nc = mapChat(raw)
        currentChatId = nc.id
        setActiveChatId(nc.id)
        setChats(p => [nc, ...p])
      } catch { toast.error('Ошибка создания чата'); return }
    }

    // Add user message to local state
    const userMsg: Message & { reasoning?: string } = {
      id: `temp-${Date.now()}`,
      chatId: currentChatId || 'guest',
      userId: user?.id || 'guest',
      role: 'user',
      content,
      tokensUsed: 0,
      createdAt: now,
    }

    // Save to DB if authenticated
    if (user && currentChatId) {
      try {
        const raw = await blink.db.table('messages').create({ chat_id: currentChatId, user_id: user.id, role: 'user', content, tokens_used: 0, created_at: now }) as any
        setMessages(p => [...p, mapMessage(raw)])
      } catch { setMessages(p => [...p, userMsg]) }
    } else {
      setMessages(p => [...p, userMsg])
    }

    // Stream AI response
    setIsStreaming(true)
    setStreamContent('')
    setStreamReasoning('')
    setIsReasoningDone(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const context = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      context.push({ role: 'user', content })

      // Get auth token if available
      let authHeader: string | null = null
      if (user) {
        try { const token = await blink.auth.getValidToken(); if (token) authHeader = `Bearer ${token}` } catch {}
      }

      const res = await fetch(AI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeader ? { 'Authorization': authHeader } : {}) },
        body: JSON.stringify({
          modelId: selectedModel.id,
          messages: [
            { role: 'system', content: 'Ты полезный AI-ассистент. Отвечай на русском языке, если вопрос задан на русском. Используй markdown для форматирования.' },
            ...context,
          ],
          guestCount: user ? 0 : guestCount,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        if (errData.error === 'auth_required') { setShowAuthModal(true); return }
        throw new Error(errData.error || 'Ошибка API')
      }

      let fullContent = ''
      let fullReasoning = ''
      let reasoningComplete = false

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'reasoning') {
              fullReasoning += parsed.chunk
              setStreamReasoning(fullReasoning)
            } else if (parsed.type === 'content') {
              if (!reasoningComplete && fullReasoning) { setIsReasoningDone(true); reasoningComplete = true }
              fullContent += parsed.chunk
              setStreamContent(fullContent)
            } else if (parsed.type === 'done') {
              setIsReasoningDone(true)
            } else if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) throw e
          }
        }
      }

      // Save AI response
      const aiMsg: Message & { reasoning?: string } = {
        id: `ai-${Date.now()}`,
        chatId: currentChatId || 'guest',
        userId: user?.id || 'ai',
        role: 'assistant',
        content: fullContent,
        tokensUsed: 0,
        createdAt: new Date().toISOString(),
        reasoning: fullReasoning || undefined,
      }

      if (user && currentChatId) {
        try {
          const raw = await blink.db.table('messages').create({ chat_id: currentChatId, user_id: user.id, role: 'assistant', content: fullContent, tokens_used: 0, created_at: new Date().toISOString() }) as any
          const saved = mapMessage(raw)
          setMessages(p => [...p, { ...saved, reasoning: fullReasoning || undefined }])
          await blink.db.table('chats').update(currentChatId, { updated_at: new Date().toISOString() })
        } catch { setMessages(p => [...p, aiMsg]) }
      } else {
        setMessages(p => [...p, aiMsg])
      }

    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Stream error:', err)
      toast.error(err.message || 'Ошибка AI. Попробуйте снова.')
    } finally {
      setStreamContent('')
      setStreamReasoning('')
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [user, isStreaming, activeChatId, messages, selectedModel, guestCount])

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e5e5e5] overflow-hidden">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="lg:hidden p-1.5 rounded-lg btn-ghost text-[#666]">
              <Menu className="w-5 h-5" />
            </button>
            <ModelSelector selected={selectedModel} onChange={handleModelChange} />
          </div>
          <div className="flex items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555]">{3 - guestCount} сообщений осталось</span>
                <button onClick={() => navigate({ to: '/login' })} className="px-3 py-1.5 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all">Войти</button>
                <button onClick={() => navigate({ to: '/register' })} className="px-3 py-1.5 rounded-lg btn-primary text-sm">Регистрация</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {user.email?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && !isStreaming ? (
            <WelcomeScreen model={selectedModel} onSend={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} userInitial={user?.email?.[0]?.toUpperCase() || 'Г'} />
              ))}
              {isStreaming && (
                <StreamingMessage content={streamContent} reasoning={streamReasoning} isReasoningDone={isReasoningDone} />
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Input */}
        <div className="shrink-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/95 to-transparent pt-6">
          <ChatInput onSend={user ? handleSend : (t) => { if (guestCount >= 3) { setShowAuthModal(true) } else { handleSend(t) } }} isLoading={isStreaming} />
        </div>
      </div>
    </div>
  )
}
