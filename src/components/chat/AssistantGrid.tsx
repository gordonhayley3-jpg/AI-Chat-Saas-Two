import { Dumbbell, PenTool, Brain, Search, Sparkles, Image as ImageIcon, Video, Mic } from 'lucide-react'

const ASSISTANTS = [
  { id: 'trainer', name: 'AI Trainer', desc: 'Personal training plans', icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'writer', name: 'Writer', desc: 'Expert copy & creative writing', icon: PenTool, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'expert', name: 'Assistant', desc: 'Answers to any question', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'search', name: 'Search', desc: 'Real-time web browsing', icon: Search, color: 'text-green-400', bg: 'bg-green-400/10' },
]

const TOOLS = [
  { id: 'animate', name: 'Animate photo', desc: 'Bring images to life', icon: Sparkles, badge: '4.92', type: 'Prompt' },
  { id: 'video', name: 'Video generator', desc: 'Create cinematic videos', icon: Video, badge: '4.56', type: 'Tool' },
  { id: 'background', name: 'Remove background', desc: 'Perfect cutouts in seconds', icon: ImageIcon, badge: 'NEW', type: 'Auto' },
  { id: 'voice', name: 'AI Voice', desc: 'Professional narration', icon: Mic, badge: 'BETA', type: 'Audio' },
]

export function AssistantGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 mt-12 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground/90 flex items-center gap-2">
          AI Assistants
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-all opacity-50 cursor-not-allowed"><PenTool className="w-4 h-4" rotate={-90} /></button>
          <button className="p-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-all"><PenTool className="w-4 h-4" rotate={90} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSISTANTS.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="premium-card p-5 text-left flex flex-col gap-4 group rounded-2xl"
          >
            <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <a.icon className={`w-6 h-6 ${a.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{a.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ToolGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 mt-16 pb-24 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground/90">Popular Tools</h2>
        <button className="text-xs font-bold text-primary hover:underline underline-offset-4 tracking-wider uppercase">View all</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="premium-card p-5 text-left flex flex-col gap-4 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/80 text-[10px] font-bold text-foreground">
              {t.badge}
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <t.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{t.type}</div>
              <h3 className="font-bold text-sm text-foreground">{t.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
