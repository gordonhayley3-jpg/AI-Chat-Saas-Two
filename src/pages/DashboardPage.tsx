import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { Zap, MessageSquare, TrendingUp, ShoppingCart, ArrowLeft, Check, Star, Sparkles, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { formatDate, formatTokens } from '../lib/utils'

interface Transaction {
  id: string
  userId: string
  amount: number
  type: string
  description?: string
  createdAt: string
}

const PACKAGES = [
  { id: 'starter', name: 'Starter', tokens: 5000, price: 5, popular: false, desc: 'Perfect for light use' },
  { id: 'pro', name: 'Pro', tokens: 25000, price: 19, popular: true, desc: 'Most popular' },
  { id: 'ultimate', name: 'Ultimate', tokens: 100000, price: 59, popular: false, desc: 'For power users' },
]

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { balance, loading: balanceLoading } = useTokenBalance(user?.id)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chatCount, setChatCount] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/login' })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  // Handle success redirect from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      toast.success('Payment successful! Tokens are being added to your account.')
      window.history.replaceState({}, '', '/dashboard')
    }
    if (params.get('canceled') === 'true') {
      toast.error('Payment canceled.')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const fetchData = async () => {
    if (!user) return
    try {
      const [txnsRaw, chatsRaw] = await Promise.all([
        blink.db.table('token_transactions').list({
          where: { user_id: user.id },
          orderBy: { created_at: 'desc' },
          limit: 10,
        }) as Promise<any[]>,
        blink.db.table('chats').list({ where: { user_id: user.id } }) as Promise<any[]>,
      ])
      const txns = txnsRaw.map(t => ({
        id: t.id, userId: t.user_id, amount: Number(t.amount),
        type: t.type, description: t.description, createdAt: t.created_at,
      }))
      setTransactions(txns)
      setChatCount(chatsRaw.length)
      const used = txns.filter(t => t.type === 'usage').reduce((sum, t) => sum + Math.abs(t.amount), 0)
      setTotalUsed(used)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    if (!user) return
    setPurchasingId(pkg.id)
    try {
      const response = await fetch('https://9a14x0l5--stripe-checkout.functions.blink.new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, userEmail: user.email, userId: user.id }),
      })
      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (err) {
      toast.error('Payment error. Please try again.')
    } finally {
      setPurchasingId(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  if (authLoading || balanceLoading) {
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
          <Link to="/chat" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Chat
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
          </div>
          <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and tokens</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Token Balance', value: formatTokens(balance?.tokens || 0), sub: `${(balance?.tokens || 0).toLocaleString()} tokens`, icon: Zap },
            { label: 'Total Chats', value: chatCount.toString(), sub: 'Conversations created', icon: MessageSquare },
            { label: 'Tokens Used', value: formatTokens(totalUsed), sub: 'Total consumed', icon: TrendingUp },
          ].map((s, i) => (
            <div key={s.label} className={`bg-card border border-border rounded-2xl p-6 animate-fade-in stagger-${i + 1}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Token packages */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Purchase Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PACKAGES.map((pkg, i) => (
              <div key={pkg.id} className={`bg-card border rounded-2xl p-6 relative overflow-hidden animate-fade-in transition-all stagger-${i + 1} ${pkg.popular ? 'border-primary/50' : 'border-border hover:border-primary/30'}`}
                style={pkg.popular ? { boxShadow: '0 0 32px hsl(257 93% 68% / 0.1)' } : {}}>
                {pkg.popular && <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'var(--gradient-primary)' }} />}
                {pkg.popular && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary mb-3">
                    <Star className="w-3 h-3" /> Popular
                  </div>
                )}
                <div className="mb-3">
                  <div className="text-base font-semibold">{pkg.name}</div>
                  <div className="text-sm text-primary font-medium">{pkg.tokens.toLocaleString()} tokens</div>
                </div>
                <div className="text-3xl font-bold mb-4">${pkg.price}</div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasingId === pkg.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${pkg.popular ? 'btn-glow text-white' : 'border border-border hover:border-primary/50 hover:bg-secondary'}`}
                >
                  {purchasingId === pkg.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : <ShoppingCart className="w-4 h-4" />}
                  {purchasingId === pkg.id ? 'Redirecting...' : 'Buy now'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Check className="w-3 h-3 text-primary" />
            Tokens never expire · Secure payment via Stripe · Instant delivery
          </p>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {transactions.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {transactions.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${txn.type === 'purchase' ? 'bg-green-500/10 text-green-400' : txn.type === 'bonus' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {txn.type === 'purchase' ? '+' : txn.type === 'bonus' ? '★' : '−'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{txn.description || txn.type}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(txn.createdAt)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${txn.amount > 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()} tokens
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
