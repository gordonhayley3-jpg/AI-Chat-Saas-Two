import { useRef, useEffect, useState } from 'react'
import { Send, Zap, Paperclip } from 'lucide-react'
import { estimateTokens } from '../../lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  tokenBalance: number
  disabled?: boolean
}

export default function ChatInput({ onSend, isLoading, tokenBalance, disabled }: ChatInputProps) {
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
    <div className="px-4 py-4">
      <div className={`relative bg-card border rounded-2xl transition-all ${noTokens ? 'border-destructive/50' : 'border-border focus-within:border-primary/50'}`}
        style={noTokens ? {} : { boxShadow: 'none' }}
      >
        {noTokens && (
          <div className="px-4 pt-3 pb-0 text-xs text-destructive flex items-center gap-1">
            <Zap className="w-3 h-3" /> No tokens remaining. Purchase more to continue.
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={noTokens ? 'Purchase tokens to continue chatting...' : 'Message NexusAI... (Enter to send, Shift+Enter for new line)'}
          disabled={isLoading || noTokens || disabled}
          rows={1}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ maxHeight: '200px', minHeight: '44px' }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors" title="Attach file (coming soon)">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span className={tokenBalance < 500 ? 'text-destructive' : ''}>{tokenBalance.toLocaleString()} tokens</span>
              {value && <span className="text-muted-foreground/60">· ~{estimatedTokens} estimated</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">⏎ send · ⇧⏎ newline</span>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading || noTokens || disabled}
              className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">NexusAI can make mistakes. Consider verifying important information.</p>
    </div>
  )
}
