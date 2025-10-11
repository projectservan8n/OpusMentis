'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Send, Sparkles, User } from 'lucide-react'

export default function AiChatDemo() {
  const [messages, setMessages] = useState([
    {
      role: 'user',
      content: 'Can you explain photosynthesis?',
      timestamp: '2:15 PM'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')

  const assistantResponse = "Photosynthesis is the process where plants convert light energy into chemical energy. Here are the key points:\n\n1. Light Reaction: Occurs in chloroplasts\n2. Carbon Fixation: CO₂ is converted to glucose\n3. Energy Output: Creates ATP and NADPH\n\nWould you like me to generate flashcards on this topic?"

  useEffect(() => {
    // Simulate typing effect
    let timeout: NodeJS.Timeout

    const startTyping = () => {
      setIsTyping(true)
      timeout = setTimeout(() => {
        let index = 0
        const typingInterval = setInterval(() => {
          if (index < assistantResponse.length) {
            setCurrentResponse(assistantResponse.slice(0, index + 1))
            index++
          } else {
            clearInterval(typingInterval)
            setIsTyping(false)
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: assistantResponse,
              timestamp: '2:15 PM'
            }])
            setCurrentResponse('')

            // Add follow-up question
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'user',
                content: 'Yes, please create flashcards!',
                timestamp: '2:16 PM'
              }])

              // Reset for loop
              setTimeout(() => {
                setMessages([{
                  role: 'user',
                  content: 'Can you explain photosynthesis?',
                  timestamp: '2:15 PM'
                }])
                startTyping()
              }, 3000)
            }, 2000)
          }
        }, 30)
      }, 1000)
    }

    startTyping()

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Card className="w-full shadow-2xl border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Study Assistant</h3>
            <p className="text-xs text-blue-100">Always ready to help</p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator with streaming response */}
          {(isTyping || currentResponse) && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  {currentResponse ? (
                    <>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {currentResponse}
                        <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                      </p>
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 flex items-center">
              <input
                type="text"
                placeholder="Ask me anything about your study materials..."
                className="flex-1 outline-none text-sm bg-transparent"
                disabled
              />
              <MessageCircle className="h-4 w-4 text-gray-400" />
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50"
              disabled
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
