'use client'

export default function PdfViewerDemo() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-auto rounded-lg shadow-2xl transition-transform hover:scale-105"
      style={{ maxHeight: '400px' }}
    >
      {/* Browser Chrome */}
      <rect width="800" height="600" rx="8" fill="#1a1a1a" />
      <rect width="800" height="40" rx="8" fill="#2a2a2a" />

      {/* Browser Dots */}
      <circle cx="20" cy="20" r="6" fill="#ff5f56" />
      <circle cx="40" cy="20" r="6" fill="#ffbd2e" />
      <circle cx="60" cy="20" r="6" fill="#27c93f" />

      {/* URL Bar */}
      <rect x="100" y="12" width="600" height="16" rx="8" fill="#3a3a3a" />
      <text x="110" y="23" fill="#888" fontSize="10" fontFamily="monospace">
        opusmentis.app/study-packs/abc123
      </text>

      {/* PDF Content Background */}
      <rect x="20" y="60" width="560" height="520" rx="4" fill="#ffffff" />

      {/* PDF Text Lines */}
      <rect x="40" y="80" width="300" height="8" rx="4" fill="#333" opacity="0.8" />
      <rect x="40" y="100" width="520" height="6" rx="3" fill="#666" opacity="0.6" />
      <rect x="40" y="115" width="480" height="6" rx="3" fill="#666" opacity="0.6" />
      <rect x="40" y="130" width="510" height="6" rx="3" fill="#666" opacity="0.6" />

      {/* Highlighted Section - Yellow */}
      <rect x="40" y="150" width="350" height="20" rx="2" fill="#fef08a" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;0.8;0.6"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="40" y="155" width="340" height="6" rx="3" fill="#333" opacity="0.7" />
      <rect x="40" y="163" width="320" height="6" rx="3" fill="#333" opacity="0.7" />

      {/* More Text */}
      <rect x="40" y="185" width="490" height="6" rx="3" fill="#666" opacity="0.6" />
      <rect x="40" y="200" width="460" height="6" rx="3" fill="#666" opacity="0.6" />

      {/* Highlighted Section - Green */}
      <rect x="40" y="220" width="280" height="20" rx="2" fill="#86efac" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;0.8;0.6"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="40" y="225" width="270" height="6" rx="3" fill="#333" opacity="0.7" />
      <rect x="40" y="233" width="250" height="6" rx="3" fill="#333" opacity="0.7" />

      {/* More Text */}
      <rect x="40" y="255" width="500" height="6" rx="3" fill="#666" opacity="0.6" />
      <rect x="40" y="270" width="480" height="6" rx="3" fill="#666" opacity="0.6" />
      <rect x="40" y="285" width="440" height="6" rx="3" fill="#666" opacity="0.6" />

      {/* Sidebar - Highlights */}
      <rect x="600" y="60" width="180" height="520" rx="4" fill="#f5f5f5" />
      <text x="620" y="90" fill="#333" fontSize="14" fontWeight="bold">
        Highlights
      </text>

      {/* Highlight Cards */}
      <g className="highlight-card">
        <rect x="620" y="110" width="140" height="60" rx="4" fill="#fef08a" opacity="0.3" stroke="#facc15" strokeWidth="2">
          <animate
            attributeName="opacity"
            values="0.3;0.5;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
        <text x="630" y="130" fill="#333" fontSize="10">
          Page 1
        </text>
        <text x="630" y="145" fill="#555" fontSize="8">
          "Important concept about..."
        </text>
        <text x="630" y="158" fill="#555" fontSize="8">
          AI-powered study materials
        </text>
      </g>

      <g className="highlight-card">
        <rect x="620" y="185" width="140" height="60" rx="4" fill="#86efac" opacity="0.3" stroke="#22c55e" strokeWidth="2">
          <animate
            attributeName="opacity"
            values="0.3;0.5;0.3"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>
        <text x="630" y="205" fill="#333" fontSize="10">
          Page 1
        </text>
        <text x="630" y="220" fill="#555" fontSize="8">
          "Key takeaway: Transform..."
        </text>
        <text x="630" y="233" fill="#555" fontSize="8">
          your learning experience
        </text>
      </g>

      {/* Quiz Button */}
      <rect x="620" y="500" width="140" height="30" rx="6" fill="#3b82f6">
        <animate
          attributeName="fill"
          values="#3b82f6;#2563eb;#3b82f6"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <text x="640" y="520" fill="white" fontSize="12" fontWeight="bold">
        ✨ Generate Quiz
      </text>
    </svg>
  )
}
