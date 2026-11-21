"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Պիոն/վարդ՝ շերտավոր թերթերով (SVG, թեթև) */
export function Bloom({ className = "", tone = "#D9A5A0" }: { className?: string; tone?: string }) {
  const outer = [0, 60, 120, 180, 240, 300];
  const mid = [30, 90, 150, 210, 270, 330];
  const inner = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill={tone} opacity="0.55">
        {outer.map((r) => (
          <ellipse key={r} cx="50" cy="26" rx="17" ry="25" transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      <g fill={tone} opacity="0.75">
        {mid.map((r) => (
          <ellipse key={r} cx="50" cy="33" rx="13" ry="18" transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      <g fill="#F1CFC8" opacity="0.9">
        {inner.map((r) => (
          <ellipse key={r} cx="50" cy="40" rx="8" ry="11" transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="5" fill="#B89456" />
    </svg>
  );
}

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 100" className={className} aria-hidden="true">
      <path d="M30 98 C5 70 5 30 30 2 C55 30 55 70 30 98Z" fill="#B89456" opacity="0.35" />
      <path d="M30 95 L30 10" stroke="#B89456" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

/** Ծաղկային անկյուն՝ քարտի զարդարանքի համար */
export function Corner({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <Leaf className="absolute -left-1 top-6 h-16 w-8 -rotate-45" />
      <Leaf className="absolute left-10 -top-1 h-16 w-8 rotate-45" />
      <Bloom className="relative h-24 w-24" />
      <Bloom className="absolute left-14 top-10 h-12 w-12" tone="#E6BDB6" />
    </div>
  );
}

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 71) % 100,
  size: 10 + ((i * 7) % 12),
  delay: (i * 1.3) % 9,
  dur: 11 + ((i * 3) % 8),
  sway: 30 + ((i * 11) % 50),
}));

/** Շարժվող ծաղկաթերթեր (թեթև, reduced-motion-ին հարգանքով) */
export function Petals({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {PETALS.slice(0, count).map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{
            left: `${p.left}%`,
            top: -30,
            width: p.size,
            height: p.size * 1.3,
            background: i % 3 === 0 ? "#E8D5B5" : "#D9A5A0",
            opacity: 0.6,
            borderRadius: "100% 0 100% 0",
          }}
          animate={{
            y: ["0vh", "112vh"],
            x: [0, p.sway, -p.sway, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
