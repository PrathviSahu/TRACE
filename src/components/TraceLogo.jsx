export default function TraceLogo({ size = 20, withBackground = false, className = '', style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="TRACE Logo"
    >
      <defs>
        <linearGradient id="trace-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38D9C5" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
        <linearGradient id="trace-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#161B22" />
          <stop offset="100%" stopColor="#090B0E" />
        </linearGradient>
        <linearGradient id="trace-logo-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38D9C5" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#21262D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF9F43" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {withBackground && (
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7"
          fill="url(#trace-logo-bg)"
          stroke="url(#trace-logo-border)"
          strokeWidth="1.4"
        />
      )}

      {/* Code Bracket Left */}
      <path
        d="M 7.5 11 L 4 16 L 7.5 21"
        fill="none"
        stroke="#38D9C5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Code Bracket Right */}
      <path
        d="M 24.5 11 L 28 16 L 24.5 21"
        fill="none"
        stroke="#FF9F43"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* T-Trace Crossbar */}
      <line
        x1="10"
        y1="10"
        x2="22"
        y2="10"
        stroke="url(#trace-logo-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* T-Trace Vertical Stem */}
      <line
        x1="16"
        y1="10"
        x2="22"
        y2="22"
        stroke="none"
      />
      <line
        x1="16"
        y1="10"
        x2="16"
        y2="22"
        stroke="url(#trace-logo-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Graph Nodes on Crossbar */}
      <circle cx="10" cy="10" r="1.8" fill="#38D9C5" />
      <circle cx="22" cy="10" r="1.8" fill="#FF9F43" />

      {/* Midpoint Decision Node & Terminal Execution Pointer */}
      <circle cx="16" cy="16" r="1.3" fill="#38D9C5" />
      <circle cx="16" cy="22" r="2.4" fill="#FF9F43" />
      <circle cx="16" cy="22" r="1" fill="#FFFFFF" />
    </svg>
  );
}
