import { useState } from 'react'
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X, Sparkles, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { Chat } from '../../types'
import { formatDate } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, title: string) => void
  tokenBalance: number
}

export default function ChatSidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, tokenBalance }: ChatSidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filtered = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  const today = filtered.filter(c => {
    const d = new Date(c.updatedAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const older = filtered.filter(c => {
    const d = new Date(c.updatedAt)
    const now = new Date()
    return d.toDateString() !== now.toDateString()
  })

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate({ to: '/' })
  }

  const startEdit = (chat: Chat) => {
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const confirmEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <aside className="w-64 h-screen flex flex-col" style={{ background: 'hsl(var(--sidebar))' }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg btn-glow flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">NexusAI</span>
        </div>
      </div>

      {/* New chat */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-all group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-secondary border border-border text-xs outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2">
        {today.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Today</div>
            {today.map(chat => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={activeChatId === chat.id}
                editing={editingId === chat.id}
                editTitle={editTitle}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onStartEdit={() => startEdit(chat)}
                onConfirmEdit={confirmEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditChange={setEditTitle}
              />
            ))}
          </div>
        )}
        {older.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Earlier</div>
            {older.map(chat => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={activeChatId === chat.id}
                editing={editingId === chat.id}
                editTitle={editTitle}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onStartEdit={() => startEdit(chat)}
                onConfirmEdit={confirmEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditChange={setEditTitle}
              />
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">{search ? 'No chats found' : 'No chats yet. Start a new one!'}</p>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-1">
        {/* Token balance */}
        <div className="token-badge rounded-xl px-3 py-2.5 flex items-center justify-between mb-2">
          <div>
            <div className="text-xs text-muted-foreground">Token balance</div>
            <div className="text-sm font-semibold text-primary">{tokenBalance.toLocaleString()}</div>
          </div>
          <Link to="/dashboard" className="text-xs text-primary hover:underline">Buy more</Link>
        </div>
        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
        </div>
      </div>
    </aside>
  )
}

function ChatRow({ chat, active, editing, editTitle, onSelect, onDelete, onStartEdit, onConfirmEdit, onCancelEdit, onEditChange }: {
  chat: Chat; active: boolean; editing: boolean; editTitle: string
  onSelect: () => void; onDelete: () => void; onStartEdit: () => void
  onConfirmEdit: () => void; onCancelEdit: () => void; onEditChange: (v: string) => void
}) {
  return (
    <div className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm transition-all mb-0.5 ${active ? 'bg-primary/15 text-foreground' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}>
      {editing ? (
        <>
          <input
            autoFocus
            value={editTitle}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirmEdit(); if (e.key === 'Escape') onCancelEdit() }}
            className="flex-1 bg-transparent outline-none text-sm text-foreground"
          />
          <button onClick={onConfirmEdit} className="text-primary"><Check className="w-3 h-3" /></button>
          <button onClick={onCancelEdit} className="text-muted-foreground"><X className="w-3 h-3" /></button>
        </>
      ) : (
        <>
          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
          <span className="flex-1 truncate" onClick={onSelect}>{chat.title}</span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); onStartEdit() }} className="p-0.5 hover:text-foreground transition-colors"><Edit2 className="w-3 h-3" /></button>
            <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-0.5 hover:text-destructive transition-colors"><Trash2 className="w-3 h-3" /></button>
          </div>
        </>
      )}
    </div>
  )
}
