import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { Sparkles, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface AuthPageProps {
  mode: 'login' | 'signup' | 'reset'
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { signIn, signUp, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'reset') {
        await sendPasswordReset(email)
        setResetSent(true)
        toast.success('Reset link sent to your email')
      } else if (mode === 'signup') {
        await signUp(email, password, displayName)
        toast.success('Account created! Welcome to NexusAI')
        navigate({ to: '/chat' })
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
        navigate({ to: '/chat' })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: 'Welcome back',
    signup: 'Create your account',
    reset: 'Reset password',
  }

  const subtitles = {
    login: 'Sign in to continue to NexusAI',
    signup: 'Start with 1,000 free tokens',
    reset: "We'll send you a reset link",
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">NexusAI</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8" style={{ boxShadow: '0 32px 80px hsl(257 93% 68% / 0.1)' }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{titles[mode]}</h1>
            <p className="text-muted-foreground text-sm mt-1">{subtitles[mode]}</p>
          </div>

          {resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Check your email for the reset link.</p>
              <Link to="/login" className="text-sm text-primary hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Display name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <Link to="/reset-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-glow text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
              </button>
            </form>
          )}

          {!resetSent && (
            <div className="mt-6 pt-6 border-t border-border text-center">
              {mode === 'login' ? (
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-medium">Sign up free</Link>
                </p>
              ) : mode === 'signup' ? (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              ) : (
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 justify-center transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back to sign in
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
