"use client"
import { useRef, useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

interface ParticleExplosionButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function ParticleExplosionButton({ children, className = "", onClick, ...props }: ParticleExplosionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* -------- helper to load Anime.js just once -------- */
  const [animePromise] = useState(() => import("@/lib/safe-anime").then((m) => m.default).catch(() => null))

  /* ---------------- click handler ------------------- */
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const anime = await animePromise
    if (anime && containerRef.current && buttonRef.current) {
      // Button scale animation
      anime
        .timeline()
        .add({
          targets: buttonRef.current,
          scale: [1, 0.9],
          duration: 100,
          easing: "easeOutQuart",
        })
        .add({
          targets: buttonRef.current,
          scale: [0.9, 1.1],
          duration: 200,
          easing: "easeOutBack",
        })
        .add({
          targets: buttonRef.current,
          scale: [1.1, 1],
          duration: 300,
          easing: "easeOutElastic(1, .6)",
        })

      // Particle explosion
      const particleCount = 30
      const particles = Array.from({ length: particleCount }).map(() => {
        const p = document.createElement("div")
        p.style.cssText = `
          position:absolute;
          width:6px;height:6px;
          background:linear-gradient(45deg,#3b82f6,#8b5cf6,#06b6d4,#10b981);
          border-radius:50%;top:50%;left:50%;
          pointer-events:none;z-index:1000;
        `
        containerRef.current!.appendChild(p)
        return p
      })

      anime({
        targets: particles,
        translateX: () => anime.random(-200, 200),
        translateY: () => anime.random(-200, 200),
        scale: [1, 0],
        opacity: [1, 0],
        rotate: () => anime.random(0, 360),
        duration: 1500,
        easing: "easeOutExpo",
        complete: () => particles.forEach((p) => p.remove()),
      })
    }

    onClick?.(e)
  }

  /* --------------------- render ---------------------- */
  return (
    <div ref={containerRef} className="relative inline-block">
      <Button ref={buttonRef} className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
      </Button>
    </div>
  )
}
