import { useState } from 'react'
import { Search, Download, Star } from 'lucide-react'
import { AI_MODELS } from '../config/models'
import ProviderIcon from '../components/ProviderIcon'

type Filter = 'all' | 'text' | 'image' | 'video'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'text', label: 'Текст' },
  { id: 'image', label: 'Изображения' },
  { id: 'video', label: 'Видео' },
]

export default function BotsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = AI_MODELS.filter(m => {
    if (filter !== 'all' && m.category !== filter) return false
    if (
      search &&
      !m.name.toLowerCase().includes(search.toLowerCase()) &&
      !m.description.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-6">
        Все нейросети
      </h1>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] mb-4">
        <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск нейросетей..."
          className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-pill${filter === f.id ? ' active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Model grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((model, i) => (
          <div
            key={model.id}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 card-hover animate-fade-in"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-start gap-3">
              {/* Left: icon + text */}
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0">
                <ProviderIcon provider={model.provider} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] text-[hsl(var(--foreground))]">
                  {model.name}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                  {model.description}
                </div>
              </div>
              {/* Right: token price */}
              <div className="badge-token shrink-0">{model.tokenCost}</div>
            </div>

            {/* Bottom row: usage + rating */}
            <div className="flex items-center gap-4 mt-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {model.usageCount.toLocaleString('ru-RU')}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {model.rating.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Нейросети не найдены</p>
        </div>
      )}
    </div>
  )
}
