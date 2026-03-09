import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Bot, Zap, Brain, Image, Code, Search } from 'lucide-react'
import { AI_MODELS, PROVIDER_LABELS } from '../config/models'

type Filter = 'all' | 'text' | 'image' | 'code' | 'free'

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === 'openai') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#ccc]">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.512 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
  if (provider === 'google') return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
  if (provider === 'deepseek') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#1B6EF3"/>
      <text x="12" y="16" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">DS</text>
    </svg>
  )
  if (provider === 'anthropic') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4A27F">
      <path d="M17.304 3.541 12.003 17.37 6.696 3.541H2l7.693 19.918h4.614L22 3.541h-4.696z"/>
    </svg>
  )
  return <Bot size={20} />
}

const CATEGORY_ICONS = {
  text: <Zap className="w-3.5 h-3.5" />,
  image: <Image className="w-3.5 h-3.5" />,
  code: <Code className="w-3.5 h-3.5" />,
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'text', label: 'Текст' },
  { id: 'image', label: 'Изображения' },
  { id: 'code', label: 'Код' },
  { id: 'free', label: 'Бесплатные' },
]

export default function BotsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = AI_MODELS.filter(m => {
    if (filter === 'free' && !m.isFree) return false
    if (filter === 'image' && m.category !== 'image') return false
    if (filter === 'text' && m.category !== 'text') return false
    if (filter === 'code' && m.category !== 'code') return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 h-14 flex items-center gap-4">
        <Link to="/" className="p-1.5 rounded-lg btn-ghost text-[#666] hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm">Каталог моделей</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Все AI модели</h1>
          <p className="text-sm text-[#666]">Выберите подходящую модель для вашей задачи</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a]">
            <Search className="w-4 h-4 text-[#555]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск моделей..."
              className="flex-1 bg-transparent text-sm text-[#ccc] placeholder:text-[#444] outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                    : 'bg-[#141414] text-[#888] border border-[#222] hover:border-[#333] hover:text-[#ccc]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((model, i) => (
            <div
              key={model.id}
              className="bg-[#141414] border border-[#222] rounded-2xl p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                    <ProviderIcon provider={model.provider} />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-white">{model.name}</div>
                    <div className="text-xs text-[#666] mt-0.5">{PROVIDER_LABELS[model.provider]}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {model.isFree ? (
                    <span className="badge-free">Free</span>
                  ) : (
                    <span className="badge-premium">Pro</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#888] mb-4 leading-relaxed">{model.description}</p>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                {model.category === 'text' && (
                  <span className="flex items-center gap-1 text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded-lg text-[#888]">
                    <Zap className="w-3 h-3" /> Текст
                  </span>
                )}
                {model.category === 'image' && (
                  <span className="flex items-center gap-1 text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded-lg text-[#888]">
                    <Image className="w-3 h-3" /> Изображения
                  </span>
                )}
                {model.hasReasoning && (
                  <span className="flex items-center gap-1 text-[11px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg text-indigo-400">
                    <Brain className="w-3 h-3" /> Размышления
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-[#555]">
                  {model.isFree ? (
                    <span className="text-green-500/80">Бесплатно</span>
                  ) : (
                    <span>{model.inputPrice}–{model.outputPrice} токенов/1k</span>
                  )}
                </div>
                <Link
                  to="/"
                  className="px-3 py-1.5 rounded-lg btn-primary text-xs"
                  onClick={() => localStorage.setItem('selected_model_id', model.id)}
                >
                  Начать чат
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#555]">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Модели не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
