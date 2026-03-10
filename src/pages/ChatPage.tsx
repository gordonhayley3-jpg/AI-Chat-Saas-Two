import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Check, LogOut, Plus, MessageSquare, Trash2, Edit2, X, Bot, Search, Brain, Copy, RefreshCw, Paperclip, ArrowUp, PanelLeftClose, PanelLeft, FolderOpen, LayoutGrid, Bell, User, AlertTriangle } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { AI_MODELS, DEFAULT_MODEL_ID, type ModelInfo } from '../config/models'
import ProviderIcon from '../components/ProviderIcon'
import ThemeToggle, { useTheme } from '../components/ThemeToggle'
import type { Chat, Message } from '../types'

const AI_CHAT_URL = 'https://9a14x0l5--ai-chat.functions.blink.new'

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
      <div className="modal-content bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Bonus badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-sm font-semibold">
            40+ За регистрацию
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Войдите в аккаунт</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Для отправки сообщений необходимо войти или зарегистрироваться</p>
        <div className="flex gap-3">
          <button onClick={() => { navigate({ to: '/login' }); onClose() }} className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-all">Войти</button>
          <button onClick={() => { navigate({ to: '/register' }); onClose() }} className="flex-1 py-2.5 rounded-xl btn-primary text-sm">Регистрация</button>
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
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--primary))] hover:opacity-80 transition-colors mb-2">
        <Brain className="w-3.5 h-3.5" />
        <span>{isStreaming ? 'Думаю...' : 'Размышления'}</span>
        {isStreaming && (
          <span className="flex gap-0.5 ml-1">
            <span className="w-1 h-1 bg-[hsl(var(--primary))] rounded-full typing-dot" />
            <span className="w-1 h-1 bg-[hsl(var(--primary))] rounded-full typing-dot" />
            <span className="w-1 h-1 bg-[hsl(var(--primary))] rounded-full typing-dot" />
          </span>
        )}
        <span className="ml-auto text-[hsl(var(--muted-foreground))]">{open ? '▲' : '▼'}</span>
      </button>
      {open && content && (
        <div className="reasoning-block p-4 text-xs leading-relaxed font-mono overflow-y-auto max-h-48 custom-scrollbar text-[hsl(var(--muted-foreground))]">{content}</div>
      )}
    </div>
  )
}

// ======= CODE BLOCK =======
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] my-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></div>
          <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] ml-1 uppercase">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors px-2 py-1 rounded-lg hover:bg-[hsl(var(--secondary))]">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, background: 'transparent', padding: '16px 20px', fontSize: '13px', lineHeight: '1.65', fontFamily: 'var(--font-mono)' }} PreTag="div">{code}</SyntaxHighlighter>
      </div>
    </div>
  )
}

// ======= MESSAGE BUBBLE =======
function MessageBubble({ message, userInitial }: { message: Message & { reasoning?: string }; userInitial: string }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className={`flex gap-3 animate-fade-in group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${isUser ? 'bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]' : 'bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.25)]'}`}>
        {isUser ? userInitial : <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />}
      </div>
      <div className={`flex-1 max-w-[85%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="text-[11px] text-[hsl(var(--muted-foreground))] px-1">
          {isUser ? 'Вы' : 'AI'} · {new Date(message.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'message-user rounded-tr-sm' : 'rounded-tl-sm'}`}>
          {message.reasoning && !isUser && <ReasoningBlock content={message.reasoning} isStreaming={false} />}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match) return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                  return <code className="px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-mono" {...props}>{children}</code>
                },
                p({ children }) { return <p className="mb-3 last:mb-0">{children}</p> },
                ul({ children }) { return <ul className="list-disc ml-4 mb-3 space-y-1.5">{children}</ul> },
                ol({ children }) { return <ol className="list-decimal ml-4 mb-3 space-y-1.5">{children}</ol> },
                h1({ children }) { return <h1 className="text-lg font-bold mb-3">{children}</h1> },
                h2({ children }) { return <h2 className="text-base font-bold mb-2">{children}</h2> },
                h3({ children }) { return <h3 className="text-sm font-bold mb-2">{children}</h3> },
                blockquote({ children }) { return <blockquote className="border-l-2 border-[hsl(var(--primary)/0.4)] pl-4 text-[hsl(var(--muted-foreground))] mb-3">{children}</blockquote> },
              }}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <button onClick={handleCopy} className="p-1 rounded btn-ghost text-[hsl(var(--muted-foreground))]">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1 rounded btn-ghost text-[hsl(var(--muted-foreground))]"><RefreshCw className="w-3.5 h-3.5" /></button>
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
      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.25)]">
        <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="flex-1 max-w-[85%] flex flex-col gap-1.5 items-start">
        <div className="text-[11px] text-[hsl(var(--muted-foreground))] px-1">AI · сейчас</div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
          {reasoning && <ReasoningBlock content={reasoning} isStreaming={!isReasoningDone} />}
          {content ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match) return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                  return <code className="px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-mono" {...props}>{children}</code>
                },
                p({ children }) { return <p className="mb-3 last:mb-0 inline">{children}</p> },
              }}>{content}</ReactMarkdown>
              <span className="typing-cursor" />
            </div>
          ) : !reasoning ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full typing-dot" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ======= MODEL SELECTOR DROPDOWN =======
function ModelSelector({ selected, onChange }: { selected: ModelInfo; onChange: (m: ModelInfo) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'video'>('all')

  const filtered = AI_MODELS.filter(m => {
    if (filter !== 'all' && m.category !== filter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const textModels = filtered.filter(m => m.category === 'text')
  const imageModels = filtered.filter(m => m.category === 'image')
  const videoModels = filtered.filter(m => m.category === 'video')

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all text-sm">
        <ProviderIcon provider={selected.provider} size={20} />
        <span className="font-medium max-w-[140px] truncate">{selected.name}</span>
        <ChevronDown className={`w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-[420px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
            {/* Search */}
            <div className="p-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск нейросети" className="flex-1 bg-transparent text-sm placeholder:text-[hsl(var(--muted-foreground))] outline-none" autoFocus />
              </div>
              {/* Filters */}
              <div className="flex gap-1 mt-2">
                {(['all', 'text', 'image', 'video'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`filter-pill text-xs ${filter === f ? 'active' : ''}`}>
                    {{ all: 'Все', text: 'Текст', image: 'Изображения', video: 'Видео' }[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Models list */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {textModels.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Текст</div>
                  {textModels.map(m => (
                    <button key={m.id} onClick={() => { onChange(m); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${selected.id === m.id ? 'model-card-selected' : 'hover:bg-[hsl(var(--secondary))]'}`}>
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0">
                        <ProviderIcon provider={m.provider} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{m.description}</div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                          <span>⬇ {m.usageCount.toLocaleString('ru-RU')}</span>
                          <span>★ {m.rating.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge-token">{m.tokenCost}</span>
                        {selected.id === m.id && <Check className="w-4 h-4 text-[hsl(var(--primary))]" />}
                      </div>
                    </button>
                  ))}
                </>
              )}
              {imageModels.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1 border-t border-[hsl(var(--border))]">Изображения</div>
                  {imageModels.map(m => (
                    <button key={m.id} onClick={() => { onChange(m); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${selected.id === m.id ? 'model-card-selected' : 'hover:bg-[hsl(var(--secondary))]'}`}>
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0"><ProviderIcon provider={m.provider} size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{m.description}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge-token">{m.tokenCost}</span>
                        {selected.id === m.id && <Check className="w-4 h-4 text-[hsl(var(--primary))]" />}
                      </div>
                    </button>
                  ))}
                </>
              )}
              {videoModels.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1 border-t border-[hsl(var(--border))]">Видео</div>
                  {videoModels.map(m => (
                    <button key={m.id} onClick={() => { onChange(m); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${selected.id === m.id ? 'model-card-selected' : 'hover:bg-[hsl(var(--secondary))]'}`}>
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0"><ProviderIcon provider={m.provider} size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{m.description}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge-token">{m.tokenCost}</span>
                        {selected.id === m.id && <Check className="w-4 h-4 text-[hsl(var(--primary))]" />}
                      </div>
                    </button>
                  ))}
                </>
              )}
              {filtered.length === 0 && <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Модели не найдены</div>}
            </div>

            {/* All models link */}
            <Link to="/bots" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition-all border-t border-[hsl(var(--border))]">
              Все нейросети и возможности →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

// ======= SIDEBAR =======
function ChatSidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, collapsed, onToggleCollapse, user, onSignOut }: {
  chats: Chat[]; activeChatId: string | null; onNewChat: () => void; onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void; onRenameChat: (id: string, title: string) => void;
  collapsed: boolean; onToggleCollapse: () => void; user: any; onSignOut: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const w = collapsed ? 60 : 220

  return (
    <aside className="hidden lg:flex flex-col h-screen shrink-0 border-r border-[hsl(var(--sidebar-border))] sidebar-transition" style={{ width: w, background: 'hsl(var(--sidebar))' }}>
      {/* Top: Logo + collapse */}
      <div className="h-14 flex items-center justify-between px-3 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />
            </div>
            <span className="font-semibold text-sm">NexusAI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center mx-auto">
            <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggleCollapse} className="p-1.5 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]" title="Свернуть">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="px-2 pt-3 space-y-1">
        {collapsed ? (
          <>
            <button onClick={onToggleCollapse} className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--muted-foreground))]" title="Развернуть"><PanelLeft className="w-4 h-4" /></button>
            <button onClick={onNewChat} className="w-full flex items-center justify-center p-2.5 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" title="Новый чат"><Edit2 className="w-4 h-4" /></button>
            <Link to="/bots" className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--muted-foreground))]" title="Все нейросети"><LayoutGrid className="w-4 h-4" /></Link>
          </>
        ) : (
          <>
            <button onClick={onNewChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium text-sm transition-all hover:opacity-90">
              <Edit2 className="w-4 h-4" /> Новый чат
            </button>
            <Link to="/bots" className="flex items-center gap-2.5 px-3 py-2 rounded-xl btn-ghost text-[hsl(var(--sidebar-foreground))] text-sm">
              <FolderOpen className="w-4 h-4" /> Мои файлы
            </Link>
            <Link to="/bots" className="flex items-center gap-2.5 px-3 py-2 rounded-xl btn-ghost text-[hsl(var(--sidebar-foreground))] text-sm">
              <LayoutGrid className="w-4 h-4" /> Все нейросети
            </Link>
          </>
        )}
      </div>

      {/* Chat history (only when expanded) */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
          <div className="px-2 mb-2 text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Сегодня</div>
          <div className="space-y-0.5">
            {chats.map(chat => (
              <div key={chat.id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${activeChatId === chat.id ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'}`}>
                {editingId === chat.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { onRenameChat(chat.id, editTitle); setEditingId(null) }; if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 bg-transparent outline-none text-xs" />
                    <button onClick={() => { onRenameChat(chat.id, editTitle); setEditingId(null) }} className="p-1 hover:text-[hsl(var(--primary))]"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeChatId === chat.id ? 'text-[hsl(var(--primary))]' : 'opacity-40'}`} />
                    <span className="flex-1 truncate text-xs" onClick={() => onSelectChat(chat.id)}>{chat.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button onClick={e => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title) }} className="p-1 rounded hover:bg-[hsl(var(--border))] transition-colors"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); onDeleteChat(chat.id) }} className="p-1 rounded hover:bg-[hsl(var(--border))] text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {chats.length === 0 && <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">Нет чатов</div>}
          </div>
        </div>
      )}

      {/* Bottom: tariff button */}
      <div className="shrink-0 p-3 mt-auto">
        {collapsed ? (
          <Link to="/tariffs" className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--primary))]" title="Тарифы">
            <Plus className="w-4 h-4" />
          </Link>
        ) : (
          <Link to="/tariffs" className="btn-tariff w-full flex items-center justify-center">Тарифы</Link>
        )}
      </div>
    </aside>
  )
}

// ======= MOBILE SIDEBAR =======
function MobileSidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, isOpen, onClose, user, onSignOut }: {
  chats: Chat[]; activeChatId: string | null; onNewChat: () => void; onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void; isOpen: boolean; onClose: () => void; user: any; onSignOut: () => void;
}) {
  if (!isOpen) return null
  return (
    <>
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-[hsl(var(--border))] animate-slide-in-left" style={{ background: 'hsl(var(--sidebar))' }}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[hsl(var(--primary))]" />
            <span className="font-semibold text-sm">NexusAI</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-3 pt-3">
          <button onClick={() => { onNewChat(); onClose() }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium text-sm">
            <Edit2 className="w-4 h-4" /> Новый чат
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 px-2 custom-scrollbar">
          {chats.map(chat => (
            <div key={chat.id} onClick={() => { onSelectChat(chat.id); onClose() }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${activeChatId === chat.id ? 'bg-[hsl(var(--sidebar-accent))]' : 'hover:bg-[hsl(var(--sidebar-accent))]'} text-[hsl(var(--sidebar-foreground))]`}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span className="flex-1 truncate text-xs">{chat.title}</span>
            </div>
          ))}
        </div>
        <div className="p-3"><Link to="/tariffs" className="btn-tariff w-full flex items-center justify-center">Тарифы</Link></div>
      </aside>
    </>
  )
}

// ======= CHAT INPUT =======
function ChatInput({ onSend, isLoading, disabled, selectedModel }: { onSend: (text: string) => void; isLoading: boolean; disabled?: boolean; selectedModel: ModelInfo }) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (!ref.current) return; ref.current.style.height = 'auto'; ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + 'px' }, [value])
  const submit = () => { const t = value.trim(); if (!t || isLoading || disabled) return; onSend(t); setValue(''); if (ref.current) ref.current.style.height = 'auto' }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div className="chat-input-container">
        <textarea ref={ref} value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={`Напишите сообщение для ${selectedModel.name}...`}
          disabled={isLoading || disabled} rows={1}
          className="w-full bg-transparent px-5 pt-4 pb-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ maxHeight: '180px', minHeight: '48px' }} />
        <div className="flex items-center justify-between px-4 pb-3">
          <button className="p-2 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><Paperclip className="w-4 h-4" /></button>
          <button onClick={submit} disabled={!value.trim() || isLoading || disabled}
            className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center disabled:opacity-30 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:border-[hsl(var(--primary))] transition-all">
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span>Стоимость сообщения: <strong className="text-[hsl(var(--foreground))]">{selectedModel.tokenCost}</strong> <span className="text-green-500">+</span></span>
        <span className="mx-1">·</span>
        <span>Нейросеть может ошибаться</span>
      </div>
    </div>
  )
}

// ======= WELCOME SCREEN =======
function WelcomeScreen({ model, onSend, user }: { model: ModelInfo; onSend: (t: string) => void; user: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-4">
      <h1 className="text-2xl font-bold mb-2">Начните диалог</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Выберите нейросеть в меню слева и напишите ваш первый запрос</p>
      <div className="flex items-center gap-2 mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        <span>Выбрана:</span>
        <ProviderIcon provider={model.provider} size={16} />
        <span className="font-medium text-[hsl(var(--foreground))]">{model.name}</span>
      </div>
      {!user && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-sm mb-8 max-w-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Войдите в аккаунт для отправки сообщений
        </div>
      )}
    </div>
  )
}

// ======= MAIN PAGE =======
export default function ChatPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const { dark, toggle: toggleTheme } = useTheme()

  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<(Message & { reasoning?: string })[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [streamReasoning, setStreamReasoning] = useState('')
  const [isReasoningDone, setIsReasoningDone] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [guestCount, setGuestCount] = useState(() => Number(localStorage.getItem('guest_msg_count') || 0))
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(() => {
    const saved = localStorage.getItem('selected_model_id')
    return AI_MODELS.find(m => m.id === saved) || AI_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AI_MODELS[0]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { if (user) loadChats() }, [user])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamContent])

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
  const handleSelectChat = (id: string) => { setActiveChatId(id); setStreamContent(''); setStreamReasoning(''); loadMessages(id) }
  const handleDeleteChat = async (id: string) => {
    try { await blink.db.table('chats').delete(id); setChats(p => p.filter(c => c.id !== id)); if (activeChatId === id) handleNewChat(); toast.success('Чат удалён') }
    catch { toast.error('Ошибка удаления') }
  }
  const handleRenameChat = async (id: string, title: string) => {
    try { await blink.db.table('chats').update(id, { title, updated_at: new Date().toISOString() }); setChats(p => p.map(c => c.id === id ? { ...c, title } : c)) }
    catch { toast.error('Ошибка') }
  }
  const handleModelChange = (m: ModelInfo) => { setSelectedModel(m); localStorage.setItem('selected_model_id', m.id) }
  const handleSignOut = async () => { await signOut(); toast.success('Выход'); navigate({ to: '/login' }) }

  const handleSend = useCallback(async (content: string) => {
    if (isStreaming) return

    // Rate limit: 1 request per 2 seconds
    const now = Date.now()
    if (now - lastRequestTime < 2000) { toast.error('Подождите пару секунд...'); return }
    setLastRequestTime(now)

    if (!user) {
      if (guestCount >= 3) { setShowAuthModal(true); return }
      const newCount = guestCount + 1
      setGuestCount(newCount)
      localStorage.setItem('guest_msg_count', String(newCount))
    }

    const nowISO = new Date().toISOString()
    let currentChatId = activeChatId

    if (!currentChatId && user) {
      try {
        const title = content.slice(0, 60) + (content.length > 60 ? '...' : '')
        const raw = await blink.db.table('chats').create({ user_id: user.id, title, created_at: nowISO, updated_at: nowISO }) as any
        const nc = mapChat(raw)
        currentChatId = nc.id
        setActiveChatId(nc.id)
        setChats(p => [nc, ...p])
      } catch { toast.error('Ошибка создания чата'); return }
    }

    const userMsg: Message & { reasoning?: string } = { id: `temp-${Date.now()}`, chatId: currentChatId || 'guest', userId: user?.id || 'guest', role: 'user', content, tokensUsed: 0, createdAt: nowISO }
    if (user && currentChatId) {
      try { const raw = await blink.db.table('messages').create({ chat_id: currentChatId, user_id: user.id, role: 'user', content, tokens_used: 0, created_at: nowISO }) as any; setMessages(p => [...p, mapMessage(raw)]) }
      catch { setMessages(p => [...p, userMsg]) }
    } else { setMessages(p => [...p, userMsg]) }

    setIsStreaming(true); setStreamContent(''); setStreamReasoning(''); setIsReasoningDone(false)
    const controller = new AbortController(); abortRef.current = controller

    // Retry with exponential backoff
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const context = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        context.push({ role: 'user', content })
        let authHeader: string | null = null
        if (user) { try { const token = await blink.auth.getValidToken(); if (token) authHeader = `Bearer ${token}` } catch {} }

        const res = await fetch(AI_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(authHeader ? { 'Authorization': authHeader } : {}) },
          body: JSON.stringify({
            modelId: selectedModel.id,
            messages: [{ role: 'system', content: 'Ты полезный AI-ассистент. Отвечай на русском языке, если вопрос задан на русском. Используй markdown для форматирования.' }, ...context],
            guestCount: user ? 0 : guestCount,
          }),
          signal: controller.signal,
        })

        if (res.status === 429) {
          attempt++
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000
            toast.error(`Слишком много запросов. Повтор через ${delay / 1000}с...`)
            await new Promise(r => setTimeout(r, delay))
            continue
          } else {
            toast.error('Слишком много запросов. Попробуйте позже.')
            break
          }
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          if (errData.error === 'auth_required') { setShowAuthModal(true); break }
          throw new Error(errData.error || 'Ошибка API')
        }

        let fullContent = ''; let fullReasoning = ''; let reasoningComplete = false
        const reader = res.body!.getReader(); const decoder = new TextDecoder(); let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n'); buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'reasoning') { fullReasoning += parsed.chunk; setStreamReasoning(fullReasoning) }
              else if (parsed.type === 'content') { if (!reasoningComplete && fullReasoning) { setIsReasoningDone(true); reasoningComplete = true }; fullContent += parsed.chunk; setStreamContent(fullContent) }
              else if (parsed.type === 'done') { setIsReasoningDone(true) }
              else if (parsed.error) { throw new Error(parsed.error) }
            } catch (e: any) { if (e.message && !e.message.includes('JSON')) throw e }
          }
        }

        const aiMsg: Message & { reasoning?: string } = { id: `ai-${Date.now()}`, chatId: currentChatId || 'guest', userId: user?.id || 'ai', role: 'assistant', content: fullContent, tokensUsed: 0, createdAt: new Date().toISOString(), reasoning: fullReasoning || undefined }
        if (user && currentChatId) {
          try { const raw = await blink.db.table('messages').create({ chat_id: currentChatId, user_id: user.id, role: 'assistant', content: fullContent, tokens_used: 0, created_at: new Date().toISOString() }) as any; const saved = mapMessage(raw); setMessages(p => [...p, { ...saved, reasoning: fullReasoning || undefined }]); await blink.db.table('chats').update(currentChatId, { updated_at: new Date().toISOString() }) }
          catch { setMessages(p => [...p, aiMsg]) }
        } else { setMessages(p => [...p, aiMsg]) }
        break // Success, exit retry loop

      } catch (err: any) {
        if (err.name === 'AbortError') break
        attempt++
        if (attempt >= maxRetries) { console.error('Stream error:', err); toast.error(err.message || 'Ошибка AI. Попробуйте снова.') }
        else { await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000)) }
      }
    }

    setStreamContent(''); setStreamReasoning(''); setIsStreaming(false); abortRef.current = null
  }, [user, isStreaming, activeChatId, messages, selectedModel, guestCount, lastRequestTime])

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" /></div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Desktop sidebar */}
      <ChatSidebar chats={chats} activeChatId={activeChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onRenameChat={handleRenameChat} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} user={user} onSignOut={handleSignOut} />

      {/* Mobile sidebar */}
      <MobileSidebar chats={chats} activeChatId={activeChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} user={user} onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-[hsl(var(--border))] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]">
              <PanelLeft className="w-5 h-5" />
            </button>
            <ModelSelector selected={selectedModel} onChange={handleModelChange} />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            {/* Token balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm font-semibold">
              <span>0</span>
              <button className="w-5 h-5 rounded-full bg-green-500 text-[hsl(var(--card))] flex items-center justify-center text-xs font-bold hover:bg-green-400 transition-colors">+</button>
            </div>
            {/* Notifications */}
            <button className="p-2 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><Bell className="w-4 h-4" /></button>
            {/* User */}
            {user ? (
              <button onClick={handleSignOut} className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center text-xs font-bold" title={user.email}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="p-2 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><User className="w-4 h-4" /></button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && !isStreaming ? (
            <WelcomeScreen model={selectedModel} onSend={user ? handleSend : () => setShowAuthModal(true)} user={user} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} userInitial={user?.email?.[0]?.toUpperCase() || 'Г'} />)}
              {isStreaming && <StreamingMessage content={streamContent} reasoning={streamReasoning} isReasoningDone={isReasoningDone} />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Input */}
        <div className="shrink-0 pt-2">
          <ChatInput
            onSend={user ? handleSend : () => setShowAuthModal(true)}
            isLoading={isStreaming}
            disabled={false}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    </div>
  )
}
