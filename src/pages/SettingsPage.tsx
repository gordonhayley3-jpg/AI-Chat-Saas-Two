import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Bot, Mail, User, LogOut, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Выход выполнен')
    navigate({ to: '/login' })
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <header className="border-b border-[#1a1a1a] px-6 h-14 flex items-center gap-4">
        <Link to="/" className="p-1.5 rounded-lg btn-ghost text-[#666] hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-semibold text-sm">Настройки</span>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10 space-y-4">
        {/* Profile */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-widest mb-4">Профиль</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center text-2xl font-bold text-indigo-400">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-white">{user.displayName || 'Пользователь'}</div>
              <div className="text-sm text-[#666] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-widest mb-4">Аккаунт</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#555]" />
              <div>
                <div className="text-xs text-[#555]">ID пользователя</div>
                <div className="text-sm text-[#aaa] font-mono mt-0.5">{user.id}</div>
              </div>
            </div>
            {user.role && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#555]" />
                <div>
                  <div className="text-xs text-[#555]">Роль</div>
                  <div className="text-sm text-[#aaa] mt-0.5 capitalize">{user.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
