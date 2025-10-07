'use client'

export default function KanbanDemo() {
  return (
    <svg
      viewBox="0 0 900 500"
      className="w-full h-auto rounded-lg shadow-2xl"
      style={{ maxHeight: '400px' }}
    >
      {/* Background */}
      <rect width="900" height="500" rx="8" fill="#f9fafb" />

      {/* Title */}
      <text x="30" y="40" fill="#111827" fontSize="24" fontWeight="bold">
        📋 Study Plan Kanban
      </text>

      {/* Columns */}
      {/* TODO Column */}
      <g>
        <rect x="30" y="70" width="270" height="400" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
        <text x="50" y="105" fill="#6b7280" fontSize="14" fontWeight="600">
          📝 TO DO
        </text>
        <rect x="50" y="113" width="230" height="2" fill="#e5e7eb" />

        {/* Task Cards */}
        <g className="kanban-card">
          <rect x="50" y="130" width="230" height="70" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2">
            <animate
              attributeName="y"
              values="130;125;130"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="60" y="153" fill="#1e40af" fontSize="13" fontWeight="600">
            Read Chapter 3
          </text>
          <text x="60" y="172" fill="#3b82f6" fontSize="10">
            📚 Study Material</text>
          <text x="60" y="188" fill="#6b7280" fontSize="9">
            Due: Tomorrow
          </text>
        </g>

        <g className="kanban-card">
          <rect x="50" y="215" width="230" height="70" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2">
            <animate
              attributeName="y"
              values="215;210;215"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="60" y="238" fill="#92400e" fontSize="13" fontWeight="600">
            Watch lecture video
          </text>
          <text x="60" y="257" fill="#d97706" fontSize="10">
            🎥 Video Content
          </text>
          <text x="60" y="273" fill="#6b7280" fontSize="9">
            Duration: 45 min
          </text>
        </g>
      </g>

      {/* IN PROGRESS Column */}
      <g>
        <rect x="315" y="70" width="270" height="400" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
        <text x="335" y="105" fill="#6b7280" fontSize="14" fontWeight="600">
          ⚡ IN PROGRESS
        </text>
        <rect x="335" y="113" width="230" height="2" fill="#e5e7eb" />

        {/* Task Card */}
        <g className="kanban-card">
          <rect x="335" y="130" width="230" height="70" rx="6" fill="#fce7f3" stroke="#ec4899" strokeWidth="2">
            <animate
              attributeName="y"
              values="130;125;130"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke"
              values="#ec4899;#f472b6;#ec4899"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="345" y="153" fill="#9f1239" fontSize="13" fontWeight="600">
            Create flashcards
          </text>
          <text x="345" y="172" fill="#db2777" fontSize="10">
            🎴 Active Task
          </text>
          <rect x="345" y="182" width="180" height="8" rx="4" fill="#fce7f3" />
          <rect x="345" y="182" width="120" height="8" rx="4" fill="#ec4899">
            <animate
              attributeName="width"
              values="120;135;120"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <text x="535" y="190" fill="#9f1239" fontSize="9">
            67%
          </text>
        </g>
      </g>

      {/* DONE Column */}
      <g>
        <rect x="600" y="70" width="270" height="400" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
        <text x="620" y="105" fill="#6b7280" fontSize="14" fontWeight="600">
          ✅ DONE
        </text>
        <rect x="620" y="113" width="230" height="2" fill="#e5e7eb" />

        {/* Completed Task Cards */}
        <g className="kanban-card">
          <rect x="620" y="130" width="230" height="60" rx="6" fill="#d1fae5" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <text x="630" y="153" fill="#065f46" fontSize="13" fontWeight="600" textDecoration="line-through" opacity="0.7">
            Take practice quiz
          </text>
          <text x="630" y="172" fill="#059669" fontSize="10">
            ✓ Completed
          </text>
          <text x="790" y="153" fontSize="20">✓</text>
        </g>

        <g className="kanban-card">
          <rect x="620" y="205" width="230" height="60" rx="6" fill="#d1fae5" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <text x="630" y="228" fill="#065f46" fontSize="13" fontWeight="600" textDecoration="line-through" opacity="0.7">
            Review notes
          </text>
          <text x="630" y="247" fill="#059669" fontSize="10">
            ✓ Completed
          </text>
          <text x="790" y="228" fontSize="20">✓</text>
        </g>

        <g className="kanban-card">
          <rect x="620" y="280" width="230" height="60" rx="6" fill="#d1fae5" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <text x="630" y="303" fill="#065f46" fontSize="13" fontWeight="600" textDecoration="line-through" opacity="0.7">
            Summarize PDF
          </text>
          <text x="630" y="322" fill="#059669" fontSize="10">
            ✓ Completed
          </text>
          <text x="790" y="303" fontSize="20">✓</text>
        </g>
      </g>

      {/* Drag hint */}
      <text x="450" y="485" textAnchor="middle" fill="#9ca3af" fontSize="12" fontStyle="italic">
        Drag & drop tasks between columns
      </text>
    </svg>
  )
}
