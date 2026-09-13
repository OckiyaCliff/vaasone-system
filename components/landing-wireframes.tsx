import React from 'react'

/**
 * Handcrafted minimalist geometric wireframe illustrations
 * matching the Swiss/Bauhaus aesthetic in the reference design.
 * High-performance, scalable, resolution-independent vector art.
 */

export function WireframeCoil({ className = 'w-44 h-44' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Multi-layered elliptical spiral/coil */}
      {[40, 60, 80, 100, 120, 140, 160, 180, 200].map((cy, i) => (
        <ellipse
          key={cy}
          cx="100"
          cy={cy}
          rx={60 - Math.sin(i * 0.4) * 4}
          ry="14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray={i % 2 === 0 ? undefined : '2 2'}
          opacity={0.35 + (i / 9) * 0.45}
        />
      ))}
      <path
        d="M40 40 V 200 M160 40 V 200"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.3"
      />
    </svg>
  )
}

export function WireframeSpherePedestal({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Concentric pedestal base rings */}
      <ellipse cx="110" cy="155" rx="85" ry="32" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <ellipse cx="110" cy="150" rx="68" ry="24" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <ellipse cx="110" cy="145" rx="52" ry="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M25 155 C 25 180, 195 180, 195 155" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />

      {/* Wireframe Sphere */}
      <circle cx="110" cy="95" r="42" stroke="currentColor" strokeWidth="1.3" opacity="0.85" />
      <ellipse cx="110" cy="95" rx="42" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <ellipse cx="110" cy="95" rx="16" ry="42" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <line x1="110" y1="53" x2="110" y2="137" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2" />
    </svg>
  )
}

export function WireframeFloatingCubes({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top Floating Isometric Cube */}
      <g opacity="0.85">
        {/* Top face */}
        <polygon points="135,30 175,50 135,70 95,50" stroke="currentColor" strokeWidth="1.2" fill="none" />
        {/* Left face */}
        <polygon points="95,50 135,70 135,115 95,95" stroke="currentColor" strokeWidth="1.2" fill="none" />
        {/* Right face */}
        <polygon points="135,70 175,50 175,95 135,115" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </g>

      {/* Lower Foundation Cube */}
      <g opacity="0.45">
        <polygon points="80,110 130,135 80,160 30,135" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 2" />
        <polygon points="30,135 80,160 80,205 30,180" stroke="currentColor" strokeWidth="1" fill="none" />
        <polygon points="80,160 130,135 130,180 80,205" stroke="currentColor" strokeWidth="1" fill="none" />
      </g>
      <line x1="135" y1="115" x2="80" y2="135" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2" />
    </svg>
  )
}

export function WireframeSteppedBlock({ className = 'w-44 h-44' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stepped block geometry */}
      <g opacity="0.75">
        {/* Top Step */}
        <polygon points="70,40 110,20 145,38 105,58" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="70,40 105,58 105,85 70,67" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="105,58 145,38 145,65 105,85" stroke="currentColor" strokeWidth="1.2" fill="none" />

        {/* Middle Step */}
        <polygon points="40,85 70,70 105,88 75,103" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="40,85 75,103 75,130 40,112" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="75,103 105,88 105,115 75,130" stroke="currentColor" strokeWidth="1.2" fill="none" />

        {/* Bottom Step */}
        <polygon points="75,130 110,112 145,130 110,148" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="75,130 110,148 110,175 75,157" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <polygon points="110,148 145,130 145,157 110,175" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </g>
    </svg>
  )
}

export function WireframeCluster({ className = 'w-72 h-72' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Central tall block */}
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.9">
        <polygon points="170,40 220,68 170,96 120,68" fill="none" />
        <polygon points="120,68 170,96 170,210 120,182" fill="none" />
        <polygon points="170,96 220,68 220,182 170,210" fill="none" />
      </g>

      {/* Left overlapping block */}
      <g stroke="currentColor" strokeWidth="1.3" opacity="0.85">
        <polygon points="100,120 150,148 100,176 50,148" fill="none" />
        <polygon points="50,148 100,176 100,260 50,232" fill="none" />
        <polygon points="100,176 150,148 150,232 100,260" fill="none" />
      </g>

      {/* Right lower block */}
      <g stroke="currentColor" strokeWidth="1.3" opacity="0.85">
        <polygon points="230,140 280,168 230,196 180,168" fill="none" />
        <polygon points="180,168 230,196 230,270 180,242" fill="none" />
        <polygon points="230,196 280,168 280,242 230,270" fill="none" />
      </g>

      {/* Bottom connecting block */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.75">
        <polygon points="160,215 205,240 160,265 115,240" fill="none" />
        <polygon points="115,240 160,265 160,315 115,290" fill="none" />
        <polygon points="160,265 205,240 205,290 160,315" fill="none" />
      </g>

      {/* Consensus connection dashed guidelines */}
      <line x1="170" y1="40" x2="50" y2="148" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
      <line x1="220" y1="68" x2="280" y2="168" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
      <line x1="170" y1="210" x2="160" y2="315" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
    </svg>
  )
}
