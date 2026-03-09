import { useState } from 'react'
import { Copy, Check, Sparkles, RefreshCw, MoreVertical } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
  userEmail?: string
}

export default function MessageBubble({ message, userEmail }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-4 md:gap-6 animate-fade-in group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl shrink-0 flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:scale-105 ${
        isUser ? 'bg-secondary text-foreground border border-border/50' : 'btn-glow'
      }`}>
        {isUser ? (userEmail?.[0]?.toUpperCase() || 'U') : <Sparkles className="w-5 h-5 text-white" />}
      </div>

      {/* Content Container */}
      <div className={`flex-1 min-w-0 flex flex-col gap-2 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
        {/* Role label / Metadata */}
        <div className={`flex items-center gap-3 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40`}>
          <span>{isUser ? 'You' : 'NexusAI'}</span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Message Content */}
        <div className={`max-w-[90%] md:max-w-[85%] relative ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
          <div className={`rounded-3xl px-5 py-4 text-base leading-relaxed ${
            isUser 
              ? 'bg-secondary text-foreground rounded-tr-none border border-border/50 shadow-sm' 
              : 'text-foreground/90 max-w-none'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-code:text-primary prose-headings:text-foreground prose-strong:text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\\w+)/.exec(className || '')
                      const isInline = !match && (props as any).inline
                      if (!isInline && match) {
                        return <CodeBlock language={match[1]} code={String(children).replace(/\\n$/, '')} />
                      }
                      return (
                        <code className="px-1.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold" {...props}>
                          {children}
                        </code>
                      )
                    },
                    p({ children }) { return <p className="mb-4 last:mb-0">{children}</p> },
                    ul({ children }) { return <ul className="list-disc list-outside ml-4 mb-4 space-y-2">{children}</ul> },
                    ol({ children }) { return <ol className="list-decimal list-outside ml-4 mb-4 space-y-2">{children}</ol> },
                    h1({ children }) { return <h1 className="text-xl font-bold mb-4 tracking-tight">{children}</h1> },
                    h2({ children }) { return <h2 className="text-lg font-bold mb-3 tracking-tight">{children}</h2> },
                    h3({ children }) { return <h3 className="text-base font-bold mb-2 tracking-tight">{children}</h3> },
                    blockquote({ children }) { return <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground/80 mb-4 bg-primary/5 py-2 rounded-r-xl">{children}</blockquote> },
                    table({ children }) { return <div className="overflow-x-auto mb-4 rounded-xl border border-border/50 shadow-sm"><table className="text-sm border-collapse w-full">{children}</table></div> },
                    th({ children }) { return <th className="border-b border-border/50 px-4 py-3 bg-secondary/50 font-bold text-left text-xs uppercase tracking-wider">{children}</th> },
                    td({ children }) { return <td className="border-b border-border/20 px-4 py-3 text-sm">{children}</td> },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <CopyButton text={message.content} />
            {!isUser && (
              <>
                <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/40 hover:text-foreground transition-all" title="Regenerate">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/40 hover:text-foreground transition-all">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {message.tokensUsed > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 text-[9px] font-bold uppercase tracking-widest text-primary/60 border border-primary/10">
                <Zap className="w-2.5 h-2.5" />
                {message.tokensUsed.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-[#0d0b14] my-6 overflow-hidden shadow-2xl animate-fade-in group/code">
      <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-2 font-mono">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-all bg-white/[0.05] hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-white/[0.05] hover:border-primary/20"
        >
          {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      <div className="relative overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            background: 'transparent',
            padding: '24px',
            fontSize: '13px',
            lineHeight: '1.7',
            fontFamily: 'var(--font-mono)',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button 
      onClick={handleCopy} 
      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/40 hover:text-foreground transition-all"
      title="Copy message"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}
