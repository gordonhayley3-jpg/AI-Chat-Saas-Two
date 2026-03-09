import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles, Zap, Code2, Globe, BookOpen, Sun, Moon, Bell, ChevronDown, Check, Menu, X, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import { useTokenBalance } from '../hooks/useTokenBalance'
import ChatSidebar from '../components/chat/ChatSidebar'
import MessageBubble from '../components/chat/MessageBubble'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import { AssistantGrid, ToolGrid } from '../components/chat/AssistantGrid'
import type { Chat, Message, AIModel } from '../types'
import { estimateTokens } from '../lib/utils'
import { AI_MODELS, DEFAULT_MODEL_ID } from '../config/models'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu'

function mapChat(r: any): Chat {
  return { id: r.id, userId: r.user_id, title: r.title, createdAt: r.created_at, updatedAt: r.updated_at }
}

function mapMessage(r: any): Message {
  return { id: r.id, chatId: r.chat_id, userId: r.user_id, role: r.role, content: r.content, tokensUsed: Number(r.tokens_used) || 0, createdAt: r.created_at }
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { balance, fetchBalance, deductTokens } = useTokenBalance(user?.id)
  
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AI_MODELS[0])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/login' })
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
    if (window.innerWidth < 1024) setSidebarOpen(false)
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

    // Token Calculation
    const estInput = estimateTokens(content)
    const costEstimate = (estInput * selectedModel.inputPrice) + 500 // padding for response
    
    if ((balance?.tokens || 0) < costEstimate) {
      toast.error('Insufficient tokens. Please buy more.')
      return
    }

    const now = new Date().toISOString()
    let currentChatId = activeChatId

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
    const userTokens = estInput * selectedModel.inputPrice
    try {
      const raw = await blink.db.table('messages').create({
        chat_id: currentChatId,
        user_id: user.id,
        role: 'user',
        content,
        tokens_used: userTokens,
        created_at: now,
      }) as any
      setMessages(prev => [...prev, mapMessage(raw)])
    } catch (err) {
      toast.error('Failed to send')
      return
    }

    // Stream AI
    setIsStreaming(true)
    setStreamingContent('')
    let fullContent = ''

    try {
      const context = messages.slice(-6).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      context.push({ role: 'user', content })

      await blink.ai.streamText(
        {
          messages: [
            {
              role: 'system' as const,
              content: 'You are NexusAI, a premium AI assistant. Provide expert, clear, and high-fidelity responses. Use markdown.',
            },
            ...context,
          ],
          model: selectedModel.id as any,
        },
        (chunk: string) => {
          fullContent += chunk
          setStreamingContent(fullContent)
        }
      )

      const aiTokens = estimateTokens(fullContent) * selectedModel.outputPrice
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
      await deductTokens(userTokens + aiTokens)
      await fetchBalance()
      await blink.db.table('chats').update(currentChatId, { updated_at: new Date().toISOString() })
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, updatedAt: new Date().toISOString() } : c))

    } catch (err: any) {
      toast.error('AI error. Try again.')
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
    }
  }, [user, isStreaming, activeChatId, messages, balance, deductTokens, fetchBalance, selectedModel])

  if (authLoading) return null

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        tokenBalance={balance?.tokens || 0}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 glass backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-secondary transition-all text-sm font-bold tracking-tight">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="text-foreground">{selectedModel.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-dark p-2 border-border/40 rounded-2xl shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-2">Select AI Model</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40 mx-1" />
                {AI_MODELS.filter(m => !m.isHidden).map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer focus:bg-primary/10 focus:text-primary transition-all group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm">{model.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{model.provider}</span>
                    </div>
                    {selectedModel.id === model.id && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 text-xs font-bold text-primary bg-primary/5">
              <Zap className="w-3 h-3" />
              <span>{(balance?.tokens || 0).toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-secondary transition-all border border-border/50 group"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 group-hover:rotate-12 transition-transform" /> : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />}
            </button>
            
            <button className="p-2.5 rounded-xl hover:bg-secondary transition-all border border-border/50 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 cursor-pointer hover:scale-105 transition-transform overflow-hidden">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-background">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
          
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center min-h-full py-12 md:py-20 relative px-4">
              <div className="w-20 h-20 rounded-[2rem] btn-glow flex items-center justify-center mb-8 animate-pulse-glow shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-center max-w-2xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                The future of intelligence is here
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/60 mb-12 text-center max-w-md font-medium tracking-tight">
                NexusAI combines the worlds best models into a single, high-fidelity interface.
              </p>
              
              <div className="flex items-center gap-4 mb-16 animate-fade-in stagger-2 opacity-60">
                <Check className="w-4 h-4 text-primary" /> <span className="text-xs font-bold uppercase tracking-widest">Multi-Model</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Check className="w-4 h-4 text-primary" /> <span className="text-xs font-bold uppercase tracking-widest">Privacy First</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Check className="w-4 h-4 text-primary" /> <span className="text-xs font-bold uppercase tracking-widest">High Speed</span>
              </div>

              <div className="w-full max-w-4xl opacity-90">
                <AssistantGrid onSelect={(id) => handleSend(`Tell me more about the ${id} feature`)} />
                <ToolGrid onSelect={(id) => handleSend(`How do I use the ${id} tool?`)} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-10">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} userEmail={user?.email} />
              ))}
              {isStreaming && (
                streamingContent ? (
                  <div className="flex gap-4 md:gap-6 animate-fade-in group">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl btn-glow flex items-center justify-center shrink-0 shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="text-base leading-relaxed text-foreground/90 prose prose-invert max-w-none prose-p:leading-relaxed">
                        <p className="whitespace-pre-wrap">{streamingContent}</p>
                        <span className="inline-block w-1.5 h-5 bg-primary ml-1 align-middle animate-pulse rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <TypingIndicator />
                )
              )}
              <div ref={messagesEndRef} className="h-12" />
            </div>
          )}
        </main>

        {/* Fixed Input Area */}
        <div className="shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
          <ChatInput
            onSend={handleSend}
            isLoading={isStreaming}
            tokenBalance={balance?.tokens || 0}
            modelName={selectedModel.name}
          />
        </div>
      </div>
    </div>
  )
}
