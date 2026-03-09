import { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Bot, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

interface AuthPageProps {
  mode: 'login' | 'signup' | 'reset'
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { user, loading, signIn, signUp, sendPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate({ to: '/' })
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast.success('Добро пожаловать!')
        navigate({ to: '/' })
      } else if (mode === 'signup') {
        await signUp(email, password, name || undefined)
        toast.success('Аккаунт создан!')
        navigate({ to: '/' })
      } else if (mode === 'reset') {
        await sendPasswordReset(email)
        setResetSent(true)
        toast.success('Письмо отправлено')
      }
    } catch (err: any) {
      const msg = err?.message || 'Ошибка. Попробуйте снова.'
      if (msg.includes('Invalid credentials') || msg.includes('invalid_credentials')) {
        toast.error('Неверный email или пароль')
      } else if (msg.includes('already exists') || msg.includes('already_exists')) {
        toast.error('Аккаунт уже существует')
      } else if (msg.includes('weak') || msg.includes('password')) {
        toast.error('Пароль слишком простой (минимум 8 символов)')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-semibold text-lg text-white">NexusAI</span>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-7 shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-1.5">
            {mode === 'login' ? 'Войти в аккаунт' : mode === 'signup' ? 'Создать аккаунт' : 'Сброс пароля'}
          </h1>
          <p className="text-sm text-[#666] mb-6">
            {mode === 'login'
              ? 'Введите email и пароль для входа'
              : mode === 'signup'
              ? 'Заполните данные для регистрации'
              : 'Введите email для сброса пароля'
            }
          </p>

          {resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-[#aaa]">Письмо отправлено на <strong className="text-white">{email}</strong></p>
              <p className="text-xs text-[#555] mt-2">Проверьте папку «Спам», если не видите письмо</p>
              <Link to="/login" className="block mt-5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                ← Вернуться ко входу
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Имя (необязательно)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-[#e5e5e5] placeholder:text-[#444] outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-[#e5e5e5] placeholder:text-[#444] outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Минимум 8 символов' : '••••••••'}
                      required
                      minLength={mode === 'signup' ? 8 : undefined}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl pl-10 pr-11 py-3 text-sm text-[#e5e5e5] placeholder:text-[#444] outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPass(o => !o)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <Link to="/reset-password" className="text-xs text-[#666] hover:text-indigo-400 transition-colors">
                    Забыли пароль?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || (mode !== 'reset' && !password)}
                className="w-full py-3 rounded-xl btn-primary text-sm font-semibold mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : mode === 'login' ? 'Войти' : mode === 'signup' ? 'Создать аккаунт' : 'Отправить письмо'}
              </button>
            </form>
          )}
        </div>

        {/* Switch mode */}
        {mode !== 'reset' && !resetSent && (
          <p className="text-center text-sm text-[#666] mt-5">
            {mode === 'login' ? (
              <>Нет аккаунта?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Зарегистрироваться</Link>
              </>
            ) : (
              <>Уже есть аккаунт?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Войти</Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
