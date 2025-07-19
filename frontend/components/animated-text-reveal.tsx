"use client"
import { useEffect, useRef } from "react"

interface AnimatedTextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedTextReveal({ text, className = "", delay = 0 }: AnimatedTextRevealProps) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function animateText() {
      if (typeof window !== "undefined" && textRef.current) {
        const { default: anime } = await import("@/lib/safe-anime")

        // Split text into spans for individual character animation
        const textElement = textRef.current
        textElement.innerHTML = text
          .split("")
          .map(
            (char) => `<span style="opacity: 0; transform: translateY(20px);">${char === " " ? "&nbsp;" : char}</span>`,
          )
          .join("")

        // Animate each character
        anime({
          targets: textElement.children,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          delay: anime.stagger(30, { start: delay }),
          easing: "easeOutExpo",
        })
      }
    }
    animateText()
  }, [text, delay])

  return <div ref={textRef} className={className} />
}
