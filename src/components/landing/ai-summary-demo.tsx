'use client'

export default function AiSummaryDemo() {
  return (
    <svg
      viewBox="0 0 700 500"
      className="w-full h-auto rounded-lg shadow-2xl"
      style={{ maxHeight: '400px' }}
    >
      {/* Background */}
      <rect width="700" height="500" rx="8" fill="#ffffff" />
      <rect width="700" height="80" rx="8" fill="#f3f4f6" />

      {/* Header */}
      <text x="30" y="50" fill="#111827" fontSize="28" fontWeight="bold">
        🤖 AI-Generated Summary
      </text>

      {/* Loading Animation / Sparkles */}
      <g opacity="0.6">
        <text x="600" y="40" fontSize="24">✨</text>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 612 28"
          to="360 612 28"
          dur="4s"
          repeatCount="indefinite"
        />
      </g>

      {/* Content Section */}
      <g>
        {/* Main Summary */}
        <rect x="30" y="100" width="640" height="120" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
        <text x="50" y="130" fill="#1e40af" fontSize="16" fontWeight="600">
          📄 Key Takeaways
        </text>

        {/* Summary Points with Typewriter Effect Simulation */}
        <text x="50" y="155" fill="#374151" fontSize="13">
          • This document covers the fundamentals of machine learning and AI
          <animate
            attributeName="opacity"
            values="0;1"
            dur="0.5s"
            fill="freeze"
          />
        </text>
        <text x="50" y="177" fill="#374151" fontSize="13">
          • Key concepts include neural networks, training data, and model optimization
          <animate
            attributeName="opacity"
            values="0;1"
            begin="0.5s"
            dur="0.5s"
            fill="freeze"
          />
        </text>
        <text x="50" y="199" fill="#374151" fontSize="13">
          • Practical applications in real-world scenarios are thoroughly explained
          <animate
            attributeName="opacity"
            values="0;1"
            begin="1s"
            dur="0.5s"
            fill="freeze"
          />
        </text>
      </g>

      {/* Topics Section */}
      <g>
        <text x="30" y="250" fill="#111827" fontSize="18" fontWeight="600">
          🏷️ Topics Covered
        </text>

        {/* Topic Badges */}
        <g className="topic-badge">
          <rect x="30" y="265" width="130" height="32" rx="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5">
            <animate
              attributeName="fill"
              values="#dbeafe;#bfdbfe;#dbeafe"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="95" y="287" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="500">
            Machine Learning
          </text>
        </g>

        <g className="topic-badge">
          <rect x="175" y="265" width="110" height="32" rx="16" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5">
            <animate
              attributeName="fill"
              values="#fce7f3;#fbcfe8;#fce7f3"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="230" y="287" textAnchor="middle" fill="#9f1239" fontSize="12" fontWeight="500">
            Neural Networks
          </text>
        </g>

        <g className="topic-badge">
          <rect x="300" y="265" width="100" height="32" rx="16" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5">
            <animate
              attributeName="fill"
              values="#d1fae5;#a7f3d0;#d1fae5"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="350" y="287" textAnchor="middle" fill="#065f46" fontSize="12" fontWeight="500">
            Deep Learning
          </text>
        </g>

        <g className="topic-badge">
          <rect x="415" y="265" width="90" height="32" rx="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5">
            <animate
              attributeName="fill"
              values="#fef3c7;#fde68a;#fef3c7"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="460" y="287" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="500">
            AI Ethics
          </text>
        </g>
      </g>

      {/* Study Actions */}
      <g>
        <text x="30" y="335" fill="#111827" fontSize="18" fontWeight="600">
          🎯 Generated Study Materials
        </text>

        {/* Flashcards Card */}
        <g className="action-card">
          <rect x="30" y="350" width="200" height="110" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="30" y="350" width="200" height="40" rx="8" fill="#8b5cf6" />
          <text x="130" y="376" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            🎴 Flashcards
          </text>
          <text x="50" y="410" fill="#374151" fontSize="13">
            • 12 cards generated
          </text>
          <text x="50" y="430" fill="#374151" fontSize="13">
            • Ready to study
          </text>
          <circle cx="210" cy="440" r="8" fill="#10b981">
            <animate
              attributeName="r"
              values="8;10;8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Kanban Card */}
        <g className="action-card">
          <rect x="250" y="350" width="200" height="110" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="250" y="350" width="200" height="40" rx="8" fill="#f59e0b" />
          <text x="350" y="376" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            📋 Kanban Plan
          </text>
          <text x="270" y="410" fill="#374151" fontSize="13">
            • 8 tasks created
          </text>
          <text x="270" y="430" fill="#374151" fontSize="13">
            • Prioritized & ready
          </text>
          <circle cx="430" cy="440" r="8" fill="#10b981">
            <animate
              attributeName="r"
              values="8;10;8"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Quiz Card */}
        <g className="action-card">
          <rect x="470" y="350" width="200" height="110" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="470" y="350" width="200" height="40" rx="8" fill="#ec4899" />
          <text x="570" y="376" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            ✏️ Practice Quiz
          </text>
          <text x="490" y="410" fill="#374151" fontSize="13">
            • 10 questions
          </text>
          <text x="490" y="430" fill="#374151" fontSize="13">
            • Test your knowledge
          </text>
          <circle cx="650" cy="440" r="8" fill="#10b981">
            <animate
              attributeName="r"
              values="8;10;8"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  )
}
