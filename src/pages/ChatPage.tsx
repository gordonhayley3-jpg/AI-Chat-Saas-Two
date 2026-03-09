import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles, Zap, Code2, Globe, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { useTokenBalance } from '../hooks/useTokenBalance'
import ChatSidebar from '../components/chat/ChatSidebar'
import MessageBubble from '../components/chat/MessageBubble'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import type { Chat, Message } from '../types'
import { estimateTokens } from '../lib/utils'

const STARTERS = [
  { icon: Sparkles, text: 'Explain quantum computing in simple terms' },
  { icon: Code2, text: 'Write a React hook for debouncing input' },
  { icon: Globe, text: 'Summarize the latest trends in AI' },
  { icon: BookOpen, text: 'Help me plan a study schedule for learning TypeScript' },
]

function mapChat(r: any): Chat {
  return { id: r.id, userId: r.user_id, title: r.title, createdAt: r.created_at, updatedAt: r.updated_at }
}

function mapMessage(r: any): Message {
  return { id: r.id, chatId: r.chat_id, userId: r.user_id, role: r.role, content: r.content, tokensUsed: Number(r.tokens_used) || 0, createdAt: r.created_at }
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { balance, fetchBalance, deductTokens } = useTokenBalance(user?.id)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) loadChats()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const loadChats = async () => {
    if (!user) return
    try {
      const result = await blink.db.table('chats').list({
        where: { user_id: user.id },
        orderBy: { updated_at: 'desc' },
        limit: 50,
      }) as any[]
      setChats(result.map(mapChat))
    } catch (err) {
      console.error('Error loading chats:', err)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const result = await blink.db.table('messages').list({
        where: { chat_id: chatId },
        orderBy: { created_at: 'asc' },
        limit: 100,
      }) as any[]
      setMessages(result.map(mapMessage))
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setStreamingContent('')
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
    setStreamingContent('')
    loadMessages(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await blink.db.table('chats').delete(chatId)
      setChats(prev => prev.filter(c => c.id !== chatId))
      if (activeChatId === chatId) handleNewChat()
      toast.success('Chat deleted')
    } catch (err) {
      toast.error('Failed to delete chat')
    }
  }

  const handleRenameChat = async (chatId: string, title: string) => {
    try {
      await blink.db.table('chats').update(chatId, { title, updated_at: new Date().toISOString() })
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c))
    } catch (err) {
      toast.error('Failed to rename chat')
    }
  }

  const handleSend = useCallback(async (content: string) => {
    if (!user || isStreaming) return

    const estimatedCost = estimateTokens(content) + 200
    if ((balance?.tokens || 0) < estimatedCost) {
      toast.error('Insufficient tokens. Please purchase more in the dashboard.')
      return
    }

    const now = new Date().toISOString()
    let currentChatId = activeChatId

    // Create new chat if needed
    if (!currentChatId) {
      try {
        const title = content.slice(0, 60) + (content.length > 60 ? '...' : '')
        const newChatRaw = await blink.db.table('chats').create({
          user_id: user.id,
          title,
          created_at: now,
          updated_at: now,
        }) as any
        const newChat = mapChat(newChatRaw)
        currentChatId = newChat.id
        setActiveChatId(newChat.id)
        setChats(prev => [newChat, ...prev])
      } catch (err) {
        toast.error('Failed to create chat')
        return
      }
    }

    // Save user message
    const userTokens = estimateTokens(content)
    let userMsg: Message
    try {
      const raw = await blink.db.table('messages').create({
        chat_id: currentChatId,
        user_id: user.id,
        role: 'user',
        content,
        tokens_used: userTokens,
        created_at: now,
      }) as any
      userMsg = mapMessage(raw)
      setMessages(prev => [...prev, userMsg])
    } catch (err) {
      toast.error('Failed to send message')
      return
    }

    // Stream AI response
    setIsStreaming(true)
    setStreamingContent('')
    let fullContent = ''

    try {
      const context = messages.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      context.push({ role: 'user', content })

      await blink.ai.streamText(
        {
          messages: [
            {
              role: 'system' as const,
              content: 'You are NexusAI, a brilliant and helpful AI assistant. Provide clear, accurate, and thoughtful responses. Use proper markdown formatting. For code, always use fenced code blocks with the language specified.',
            },
            ...context,
          ],
          model: 'gpt-4.1-mini',
        },
        (chunk: string) => {
          fullContent += chunk
          setStreamingContent(fullContent)
        }
      )

      // Save AI message
      const aiTokens = estimateTokens(fullContent)
      const totalTokens = userTokens + aiTokens
      const aiMsgRaw = await blink.db.table('messages').create({
        chat_id: currentChatId,
        user_id: user.id,
        role: 'assistant',
        content: fullContent,
        tokens_used: aiTokens,
        created_at: new Date().toISOString(),
      }) as any
      setMessages(prev => [...prev, mapMessage(aiMsgRaw)])
      setStreamingContent('')

      // Deduct tokens
      await deductTokens(totalTokens)
      await fetchBalance()

      // Update chat timestamp
      await blink.db.table('chats').update(currentChatId, { updated_at: new Date().toISOString() })
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, updatedAt: new Date().toISOString() } : c))

    } catch (err: any) {
      const isAuthError = err?.message?.includes('401') || err?.message?.includes('Unauthorized')
      if (isAuthError) {
        navigate({ to: '/login' })
        return
      }
      toast.error('AI response failed. Please try again.')
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
    }
  }, [user, isStreaming, activeChatId, messages, balance, deductTokens, fetchBalance, navigate])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl btn-glow flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop */}
      <div className={`hidden lg:block transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          tokenBalance={balance?.tokens || 0}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <div className="space-y-1">
                <span className="block w-4 h-0.5 bg-current rounded" />
                <span className="block w-4 h-0.5 bg-current rounded" />
                <span className="block w-3 h-0.5 bg-current rounded" />
              </div>
            </button>
            <span className="text-sm font-medium text-muted-foreground truncate max-w-48">
              {activeChatId ? chats.find(c => c.id === activeChatId)?.title || 'Chat' : 'New Chat'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="token-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
              <Zap className="w-3 h-3 text-primary" />
              <span className="font-semibold text-primary">{(balance?.tokens || 0).toLocaleString()}</span>
              <span className="text-muted-foreground">tokens</span>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="w-16 h-16 rounded-2xl btn-glow flex items-center justify-center mb-6 animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 text-center">What can I help with?</h1>
              <p className="text-muted-foreground text-sm mb-10 text-center max-w-sm">Start a conversation or try one of these prompts</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className={`flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-secondary text-left transition-all group animate-fade-in stagger-${i + 1}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <s.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} userEmail={user?.email} />
              ))}
              {isStreaming && (
                streamingContent ? (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="message-assistant rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-[75%]">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                      <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <TypingIndicator />
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0">
          <ChatInput
            onSend={handleSend}
            isLoading={isStreaming}
            tokenBalance={balance?.tokens || 0}
          />
        </div>
      </div>
    </div>
  )
}
