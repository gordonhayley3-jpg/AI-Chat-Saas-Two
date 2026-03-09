import { Sparkles } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="message-assistant rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
      </div>
    </div>
  )
}
