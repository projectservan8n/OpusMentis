'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  User,
  Bot,
  Crown,
  X,
  Minimize2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { clerkTierToAppTier, PLAN_LIMITS } from '@/lib/subscription-utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface FloatingAIChatProps {
  studyPackId: string
}

export default function FloatingAIChat({ studyPackId }: FloatingAIChatProps) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isFirstOpenRef = useRef(true)
  const shouldAutoScrollRef = useRef(true)

  // Get user's subscription tier and limits
  const clerkTier = (user?.publicMetadata?.plan as string) || 'free_plan'
  const userTier = clerkTierToAppTier(clerkTier)
  const limits = PLAN_LIMITS[userTier]
  const isUnlimited = limits.maxChatMessagesPerDay === -1

  // Count user messages sent today
  const todayUserMessages = messages.filter((msg) => {
    if (msg.role !== 'user') return false
    const msgDate = new Date(msg.createdAt)
    const today = new Date()
    return msgDate.toDateString() === today.toDateString()
  }).length

  const remainingMessages = isUnlimited
    ? -1
    : Math.max(0, limits.maxChatMessagesPerDay - todayUserMessages)

  // Auto-scroll to bottom when new messages arrive - ONLY within chat container
  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: instant ? 'auto' : 'smooth'
        })
      }
    }
  }

  useEffect(() => {
    if (isOpen && messages.length > 0 && shouldAutoScrollRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Scroll instantly on first open, smoothly thereafter
        if (isFirstOpenRef.current) {
          scrollToBottom(true)
          isFirstOpenRef.current = false
        } else {
          scrollToBottom(false)
        }
      }, 50)
    }
  }, [messages, isOpen])

  // Reset first open flag when chat closes
  useEffect(() => {
    if (!isOpen) {
      isFirstOpenRef.current = true
    }
  }, [isOpen])

  // No need to prevent body scroll - users can interact with page while chatting
  // Removed overflow hidden to allow users to work with other features while chat is open

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory()
    }
  }, [isOpen, studyPackId])

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const response = await fetch(`/api/chat?studyPackId=${studyPackId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      setIsLoading(true)

      // Create assistant message placeholder
      const tempAssistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      }
      setMessages((prev) => [...prev, tempAssistantMessage])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studyPackId,
          message: userMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429 && errorData.upgradeRequired) {
          toast.error(errorData.error, { duration: 5000 })
          throw new Error('Rate limit reached')
        }
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let assistantResponse = ''
      let displayedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantResponse += chunk

        // Character-by-character animation
        for (let i = displayedContent.length; i < assistantResponse.length; i++) {
          displayedContent += assistantResponse[i]

          // Update message with each character
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMessage.id
                ? { ...msg, content: displayedContent }
                : msg
            )
          )

          // Small delay for typing effect (adjust speed here)
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      // Messages are already in state from streaming, no need to reload
      // Just update the temp IDs to reflect that the messages are now saved
      // (The backend has saved them, but we don't need to fetch them again)
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error(error?.message || 'Failed to send message')

      // Remove temporary messages on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg.id !== tempUserMessage.id &&
            !msg.id.startsWith('temp-assistant-')
        )
      )
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history for this study pack?')) {
      return
    }

    try {
      const response = await fetch(`/api/chat?studyPackId=${studyPackId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to clear chat history')
      }

      setMessages([])
      toast.success('Chat history cleared')
    } catch (error: any) {
      console.error('Error clearing chat history:', error)
      toast.error(error?.message || 'Failed to clear chat history')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] p-3 md:p-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Chat Assistant"
      >
        <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 items-center justify-center text-xs font-bold">
            AI
          </span>
        </span>
      </button>
    )
  }

  // Chat window when open
  return (
    <Card
      className="fixed bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto z-[9999] w-full md:w-[500px] h-[90vh] md:h-[700px] flex flex-col shadow-2xl border-2 border-primary/20 md:rounded-lg rounded-t-lg"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">AI Study Assistant</h3>
            <div className="flex items-center gap-2">
              {!isUnlimited && (
                <Badge variant="secondary" className="text-xs">
                  {remainingMessages} left
                </Badge>
              )}
              {isUnlimited && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  <Crown className="h-3 w-3 mr-1" />
                  Unlimited
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm">Start a conversation</h3>
              <p className="text-xs text-muted-foreground">
                Ask me anything about your study material!
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("Can you explain the main concepts?")}
                className="justify-start text-xs h-auto py-2"
              >
                💡 Explain the main concepts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("What are the key takeaways?")}
                className="justify-start text-xs h-auto py-2"
              >
                🎯 Key takeaways
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2 items-start',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-purple-500 text-white'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 border'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // @ts-ignore - ReactMarkdown types are complex
                          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-3" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-1 mt-2" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                          p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed" {...props} />,
                          code: ({ node, inline, ...props }: any) =>
                            inline ? (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />
                            ) : (
                              <code className="block bg-muted p-2 rounded my-2 text-xs font-mono overflow-x-auto" {...props} />
                            ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="min-w-full border-collapse border border-border" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
                          tbody: ({ node, ...props }) => <tbody {...props} />,
                          tr: ({ node, ...props }) => <tr className="border-b border-border" {...props} />,
                          th: ({ node, ...props }) => (
                            <th className="border border-border px-2 py-1 text-left font-bold text-xs" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="border border-border px-2 py-1 text-xs" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your study material..."
            className="min-h-[50px] max-h-[100px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[50px] w-[50px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Enter to send • Shift+Enter for new line
        </p>
      </div>
    </Card>
  )
}
