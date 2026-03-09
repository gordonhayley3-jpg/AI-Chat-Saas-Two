import { useState } from 'react'
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X, Sparkles, LayoutDashboard, Settings, LogOut, Shield, FileText, Wrench, CreditCard, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
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
  isOpen: boolean
  onToggle: () => void
}

export default function ChatSidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, tokenBalance, isOpen, onToggle }: ChatSidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filtered = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

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
    <>
      {/* Mobile Backdrop */}
      {!isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:w-0 lg:overflow-hidden'
        }`}
        style={{ background: 'hsl(var(--sidebar))' }}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">NexusAI</span>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-4 py-2">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-all group border border-primary/20"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            New chat
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-2 mt-4 space-y-1">
          <Link 
            to="/chat"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 text-foreground font-medium text-sm transition-all"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            My Chats
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
            <FileText className="w-4 h-4" />
            My Files
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
            <Wrench className="w-4 h-4" />
            AI Tools
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto mt-6 px-2 custom-scrollbar">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            History
          </div>
          <div className="space-y-0.5">
            {filtered.map(chat => (
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
            {filtered.length === 0 && (
              <div className="py-8 text-center px-4">
                <p className="text-xs text-muted-foreground opacity-60">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-border/50 p-3 space-y-1.5">
          <Link 
            to="/dashboard" 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-all border border-primary/10 group"
          >
            <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Pricing
          </Link>
          
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-foreground">Account</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function ChatRow({ chat, active, editing, editTitle, onSelect, onDelete, onStartEdit, onConfirmEdit, onCancelEdit, onEditChange }: {
  chat: Chat; active: boolean; editing: boolean; editTitle: string
  onSelect: () => void; onDelete: () => void; onStartEdit: () => void
  onConfirmEdit: () => void; onCancelEdit: () => void; onEditChange: (v: string) => void
}) {
  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
      active ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
    }`}>
      {editing ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            autoFocus
            value={editTitle}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirmEdit(); if (e.key === 'Escape') onCancelEdit() }}
            className="flex-1 bg-transparent outline-none text-sm text-foreground"
          />
          <button onClick={onConfirmEdit} className="p-1 hover:text-primary"><Check className="w-3 h-3" /></button>
          <button onClick={onCancelEdit} className="p-1 hover:text-muted-foreground"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <>
          <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-primary' : 'opacity-40'}`} />
          <span className="flex-1 truncate" onClick={onSelect}>{chat.title}</span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); onStartEdit() }} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
