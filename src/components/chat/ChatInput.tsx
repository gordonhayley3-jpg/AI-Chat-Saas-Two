import { useRef, useEffect, useState } from 'react'
import { Send, Zap, Paperclip, ArrowUp } from 'lucide-react'
import { estimateTokens } from '../../lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  tokenBalance: number
  disabled?: boolean
  modelName: string
}

export default function ChatInput({ onSend, isLoading, tokenBalance, disabled, modelName }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const estimatedTokens = estimateTokens(value)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleSubmit = () => {
    const text = value.trim()
    if (!text || isLoading || disabled) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const noTokens = tokenBalance === 0

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pb-6 pt-2">
      <div className={`relative chat-input-container transition-all duration-300 ${
        noTokens ? 'border-destructive/40 bg-destructive/5' : 'focus-within:border-primary/40'
      }`}>
        <div className="flex flex-col">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={noTokens ? 'Insufficient tokens...' : 'Message NexusAI...'}
            disabled={isLoading || noTokens || disabled}
            rows={1}
            className="w-full bg-transparent px-6 py-5 text-base md:text-lg outline-none resize-none placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar"
            style={{ maxHeight: '200px', minHeight: '64px' }}
          />
          
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              <button 
                className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200" 
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="h-4 w-px bg-border/50 mx-1" />
              
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/50">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>{tokenBalance.toLocaleString()} tokens</span>
                </div>
                {value && (
                  <div className="text-[10px] font-medium text-primary/60 animate-fade-in">
                    ~{estimatedTokens} est.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <span>{modelName}</span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading || noTokens || disabled}
                className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] md:text-xs text-muted-foreground/40 mt-4 font-medium tracking-wide">
        NexusAI can make mistakes. Verified by human intelligence.
      </p>
    </div>
  )
}
