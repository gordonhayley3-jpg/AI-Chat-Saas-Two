import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { Shield, Users, Zap, TrendingUp, ArrowLeft, Plus, Search, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { formatDate, formatTokens } from '../lib/utils'

interface UserRecord {
  id: string
  userId: string
  tokenBalance: number
  updatedAt: string
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addingTokens, setAddingTokens] = useState<{ id: string; userId: string; amount: string } | null>(null)
  const [stats, setStats] = useState({ totalUsers: 0, totalTokensSold: 0, totalTokensUsed: 0 })

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/login' })
    if (!authLoading && user && user.role !== 'admin') {
      toast.error('Access denied — admin only')
      navigate({ to: '/dashboard' })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user?.role === 'admin') fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [balancesRaw, txnsRaw] = await Promise.all([
        blink.db.table('token_balances').list({ limit: 100, orderBy: { updated_at: 'desc' } }) as Promise<any[]>,
        blink.db.table('token_transactions').list({ limit: 500, orderBy: { created_at: 'desc' } }) as Promise<any[]>,
      ])

      const totalSold = txnsRaw
        .filter((t: any) => t.type === 'purchase' || t.type === 'bonus')
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0)
      const totalUsed = txnsRaw
        .filter((t: any) => t.type === 'usage')
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0)

      setStats({ totalUsers: balancesRaw.length, totalTokensSold: totalSold, totalTokensUsed: totalUsed })

      const recs: UserRecord[] = balancesRaw.map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        tokenBalance: Number(b.tokens),
        updatedAt: b.updated_at,
      }))
      setRecords(recs)
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTokens = async () => {
    if (!addingTokens) return
    const amount = parseInt(addingTokens.amount)
    if (!amount || amount <= 0) { toast.error('Enter a valid token amount'); return }
    try {
      const record = records.find(r => r.id === addingTokens.id)
      if (!record) return
      await blink.db.table('token_balances').update(addingTokens.id, {
        tokens: record.tokenBalance + amount,
        updated_at: new Date().toISOString(),
      })
      await blink.db.table('token_transactions').create({
        user_id: addingTokens.userId,
        amount,
        type: 'bonus',
        description: 'Admin manual grant',
        created_at: new Date().toISOString(),
      })
      setRecords(prev => prev.map(r => r.id === addingTokens.id ? { ...r, tokenBalance: r.tokenBalance + amount } : r))
      toast.success(`Added ${amount.toLocaleString()} tokens`)
      setAddingTokens(null)
    } catch (err) {
      toast.error('Failed to add tokens')
    }
  }

  const filtered = records.filter(r => r.userId.includes(search))

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl btn-glow flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Shield className="w-4 h-4 text-primary" /> Admin Panel
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor users, tokens, and platform health</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users },
            { label: 'Tokens Distributed', value: formatTokens(stats.totalTokensSold), icon: Zap },
            { label: 'Tokens Consumed', value: formatTokens(stats.totalTokensUsed), icon: TrendingUp },
          ].map((s, i) => (
            <div key={s.label} className={`bg-card border border-border rounded-2xl p-6 animate-fade-in stagger-${i + 1}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Users ({records.length})</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by user ID..."
                className="pl-8 pr-3 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary/40 transition-colors w-56"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-border text-xs text-muted-foreground font-medium">
              <div>User ID</div>
              <div>Token Balance</div>
              <div>Last Updated</div>
              <div>Actions</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map(r => (
                <div key={r.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {r.userId[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground truncate">{r.userId.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    {r.tokenBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(r.updatedAt)}</div>
                  <div>
                    {addingTokens?.id === r.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={addingTokens.amount}
                          onChange={e => setAddingTokens({ ...addingTokens, amount: e.target.value })}
                          placeholder="Amount"
                          className="w-24 px-2 py-1 text-xs rounded-lg bg-secondary border border-border outline-none focus:border-primary/40"
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTokens(); if (e.key === 'Escape') setAddingTokens(null) }}
                        />
                        <button onClick={handleAddTokens} className="btn-glow px-2 py-1 rounded-lg text-xs text-white font-medium">Add</button>
                        <button onClick={() => setAddingTokens(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTokens({ id: r.id, userId: r.userId, amount: '' })}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add tokens
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">No users found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
