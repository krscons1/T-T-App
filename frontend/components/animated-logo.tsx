"use client"
import { useEffect, useRef } from "react"
import { Languages } from "lucide-react"

export function AnimatedLogo() {
  const logoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initializeAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Logo entrance animation
        anime({
          targets: logoRef.current,
          scale: [0, 1],
          rotate: [180, 0],
          duration: 1000,
          easing: "easeOutBack",
          delay: 300,
        })

        // Text reveal animation
        anime({
          targets: textRef.current?.children,
          translateY: [50, 0],
          opacity: [0, 1],
          duration: 800,
          delay: anime.stagger(100, { start: 800 }),
          easing: "easeOutExpo",
        })

        // Continuous floating animation
        anime({
          targets: logoRef.current,
          translateY: [-5, 5],
          duration: 2000,
          direction: "alternate",
          loop: true,
          easing: "easeInOutSine",
          delay: 1500,
        })
      }

      initializeAnime()
    }
  }, [])

  return (
    <div className="flex items-center gap-4">
      <div ref={logoRef} className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
        <Languages className="h-10 w-10 text-white relative z-10" />
      </div>
      <div ref={textRef} className="space-y-1">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Tamil Translator
        </h1>
        <p className="text-lg text-slate-300">AI-Powered Audio Translation</p>
      </div>
    </div>
  )
}
