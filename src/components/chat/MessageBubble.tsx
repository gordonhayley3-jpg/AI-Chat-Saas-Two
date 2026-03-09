import { useState } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
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
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold ${isUser ? 'bg-secondary text-foreground' : 'btn-glow'}`}>
        {isUser ? (userEmail?.[0]?.toUpperCase() || 'U') : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      {/* Content */}
      <div className={`max-w-[75%] group relative ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'message-user rounded-tr-sm' : 'message-assistant rounded-tl-sm'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match && (props as any).inline
                  if (!isInline && match) {
                    return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-secondary text-primary text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                p({ children }) { return <p className="mb-3 last:mb-0">{children}</p> },
                ul({ children }) { return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul> },
                ol({ children }) { return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol> },
                h1({ children }) { return <h1 className="text-lg font-bold mb-2">{children}</h1> },
                h2({ children }) { return <h2 className="text-base font-semibold mb-2">{children}</h2> },
                h3({ children }) { return <h3 className="text-sm font-semibold mb-1">{children}</h3> },
                blockquote({ children }) { return <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground mb-3">{children}</blockquote> },
                table({ children }) { return <div className="overflow-x-auto mb-3"><table className="text-xs border-collapse w-full">{children}</table></div> },
                th({ children }) { return <th className="border border-border px-2 py-1 bg-secondary font-medium text-left">{children}</th> },
                td({ children }) { return <td className="border border-border px-2 py-1">{children}</td> },
                strong({ children }) { return <strong className="font-semibold">{children}</strong> },
                em({ children }) { return <em className="italic">{children}</em> },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Copy button + tokens */}
        <div className={`hidden group-hover:flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <CopyButton text={message.content} />
          {message.tokensUsed > 0 && (
            <span className="text-xs text-muted-foreground">{message.tokensUsed} tokens</span>
          )}
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
    <div className="code-block my-2 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
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
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-secondary">
      {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
