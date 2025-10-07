'use client'

import { useState } from 'react'

export default function FlashcardDemo() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative w-full cursor-pointer perspective-1000"
      style={{ height: '400px', maxWidth: '600px', margin: '0 auto' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 transform-style-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card - Question */}
        <svg
          viewBox="0 0 600 400"
          className="absolute w-full h-full rounded-xl shadow-2xl backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Background - Gradient */}
          <defs>
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <rect width="600" height="400" rx="12" fill="url(#cardGradient)" />

          {/* Sparkles decoration */}
          <text x="50" y="60" fontSize="40" opacity="0.3">✨</text>
          <text x="520" y="350" fontSize="40" opacity="0.3">✨</text>

          {/* Question Label */}
          <text x="300" y="60" textAnchor="middle" fill="white" fontSize="18" fontWeight="500" opacity="0.8">
            QUESTION
          </text>

          {/* Question Text */}
          <text x="300" y="160" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
            What is OpusMentis?
          </text>
          <text x="300" y="200" textAnchor="middle" fill="white" fontSize="20">

          </text>

          {/* Tap to flip indicator */}
          <rect x="220" y="330" width="160" height="40" rx="20" fill="white" opacity="0.2">
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="300" y="357" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            Tap to flip 🔄
          </text>
        </svg>

        {/* Back of card - Answer */}
        <svg
          viewBox="0 0 600 400"
          className="absolute w-full h-full rounded-xl shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Card Background - Different Gradient */}
          <defs>
            <linearGradient id="cardGradientBack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <rect width="600" height="400" rx="12" fill="url(#cardGradientBack)" />

          {/* Brain decoration */}
          <text x="50" y="60" fontSize="40" opacity="0.3">🧠</text>
          <text x="520" y="350" fontSize="40" opacity="0.3">📚</text>

          {/* Answer Label */}
          <text x="300" y="60" textAnchor="middle" fill="white" fontSize="18" fontWeight="500" opacity="0.8">
            ANSWER
          </text>

          {/* Answer Text */}
          <text x="300" y="140" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            An AI-powered study platform that
          </text>
          <text x="300" y="175" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            transforms your PDFs, videos, and
          </text>
          <text x="300" y="210" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            audio into interactive flashcards,
          </text>
          <text x="300" y="245" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">
            summaries, and study plans!
          </text>

          {/* Tap to flip back */}
          <rect x="220" y="300" width="160" height="40" rx="20" fill="white" opacity="0.2">
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="300" y="327" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            Tap to flip 🔄
          </text>
        </svg>
      </div>
    </div>
  )
}
