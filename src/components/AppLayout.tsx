import { useState } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { Bot, Edit2, FolderOpen, LayoutGrid, PanelLeft, PanelLeftClose, Bell, User, Plus } from 'lucide-react'
import ThemeToggle, { useTheme } from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { AI_MODELS, DEFAULT_MODEL_ID, type ModelInfo } from '../config/models'
import ProviderIcon from './ProviderIcon'

/**
 * Shared layout for non-chat pages (/bots, /tariffs, /files)
 * Provides sidebar + header + content area
 */
export default function AppLayout() {
  const { user } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const w = collapsed ? 60 : 220

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen shrink-0 border-r border-[hsl(var(--sidebar-border))] sidebar-transition" style={{ width: w, background: 'hsl(var(--sidebar))' }}>
        <div className="h-14 flex items-center justify-between px-3 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />
                </div>
                <span className="font-semibold text-sm">NexusAI</span>
              </div>
              <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><PanelLeftClose className="w-4 h-4" /></button>
            </>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center mx-auto">
              <Bot className="w-4 h-4 text-[hsl(var(--primary))]" />
            </div>
          )}
        </div>

        <div className="px-2 pt-3 space-y-1">
          {collapsed ? (
            <>
              <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--muted-foreground))]"><PanelLeft className="w-4 h-4" /></button>
              <Link to="/" className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--muted-foreground))]" title="Новый чат"><Edit2 className="w-4 h-4" /></Link>
              <Link to="/bots" className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--primary))]" title="Все нейросети"><LayoutGrid className="w-4 h-4" /></Link>
            </>
          ) : (
            <>
              <Link to="/" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl btn-ghost text-[hsl(var(--sidebar-foreground))] text-sm">
                <Edit2 className="w-4 h-4" /> Новый чат
              </Link>
              <Link to="/bots" className="flex items-center gap-2.5 px-3 py-2 rounded-xl btn-ghost text-[hsl(var(--sidebar-foreground))] text-sm">
                <FolderOpen className="w-4 h-4" /> Мои файлы
              </Link>
              <Link to="/bots" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))] text-sm font-medium">
                <LayoutGrid className="w-4 h-4" /> Все нейросети
              </Link>
            </>
          )}
        </div>

        <div className="flex-1" />

        <div className="shrink-0 p-3">
          {collapsed ? (
            <Link to="/tariffs" className="w-full flex items-center justify-center p-2.5 rounded-xl btn-ghost text-[hsl(var(--primary))]"><Plus className="w-4 h-4" /></Link>
          ) : (
            <Link to="/tariffs" className="btn-tariff w-full flex items-center justify-center">Тарифы</Link>
          )}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-[hsl(var(--border))] animate-slide-in-left" style={{ background: 'hsl(var(--sidebar))' }}>
            <div className="h-14 flex items-center justify-between px-4 border-b border-[hsl(var(--sidebar-border))]">
              <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-[hsl(var(--primary))]" /><span className="font-semibold text-sm">NexusAI</span></div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg btn-ghost">✕</button>
            </div>
            <div className="px-3 pt-3 space-y-1">
              <Link to="/" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl btn-ghost text-sm"><Edit2 className="w-4 h-4" /> Новый чат</Link>
              <Link to="/bots" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))] text-sm font-medium"><LayoutGrid className="w-4 h-4" /> Все нейросети</Link>
            </div>
            <div className="flex-1" />
            <div className="p-3"><Link to="/tariffs" className="btn-tariff w-full flex items-center justify-center">Тарифы</Link></div>
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-[hsl(var(--border))] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><PanelLeft className="w-5 h-5" /></button>
            <Link to="/bots" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm font-medium hover:border-[hsl(var(--primary)/0.3)] transition-all">
              <LayoutGrid className="w-4 h-4" /> Все нейросети <span className="text-[hsl(var(--muted-foreground))]">▾</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm font-semibold">
              <span>0</span>
              <button className="w-5 h-5 rounded-full bg-green-500 text-[hsl(var(--card))] flex items-center justify-center text-xs font-bold hover:bg-green-400 transition-colors">+</button>
            </div>
            <button className="p-2 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><Bell className="w-4 h-4" /></button>
            {user ? (
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            ) : (
              <Link to="/login" className="p-2 rounded-lg btn-ghost text-[hsl(var(--muted-foreground))]"><User className="w-4 h-4" /></Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
