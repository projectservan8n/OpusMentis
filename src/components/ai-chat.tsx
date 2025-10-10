'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  User,
  Bot,
  Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { clerkTierToAppTier, PLAN_LIMITS } from '@/lib/subscription-utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AIChatProps {
  studyPackId: string
}

export default function AIChat({ studyPackId }: AIChatProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [studyPackId])

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
          // Show upgrade prompt
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantResponse += chunk

        // Update assistant message in real-time
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMessage.id
              ? { ...msg, content: assistantResponse }
              : msg
          )
        )
      }

      // Reload chat history to get final saved messages with real IDs
      await loadChatHistory()
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error(error?.message || 'Failed to send message')

      // Remove temporary messages on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg.id !== tempUserMessage.id &&
            msg.id !== `temp-assistant-${Date.now()}`
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

  if (isLoadingHistory) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Study Assistant</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Ask questions about your study material
              </p>
              {!isUnlimited && (
                <Badge variant="secondary" className="text-xs">
                  {remainingMessages} left today
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
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything about your study material! I can help explain concepts,
                answer questions, or quiz you on the content.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md text-left">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("Can you explain the main concepts?")}
                className="justify-start text-sm"
              >
                💡 Explain the main concepts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("Quiz me on this material")}
                className="justify-start text-sm"
              >
                📝 Quiz me on this material
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("What are the key takeaways?")}
                className="justify-start text-sm"
              >
                🎯 What are the key takeaways?
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 items-start',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-purple-500 text-white'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg max-w-[85%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your study material..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
