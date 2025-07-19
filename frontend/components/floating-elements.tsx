"use client"
import { useEffect, useState } from "react"
import { Languages, Zap, Shield, Globe, Mic, Volume2 } from "lucide-react"

export function FloatingElements() {
  const [elements, setElements] = useState<
    Array<{
      id: number
      x: number
      y: number
      icon: any
      delay: number
      duration: number
    }>
  >([])

  useEffect(() => {
    const icons = [Languages, Zap, Shield, Globe, Mic, Volume2]
    const newElements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[i],
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }))
    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {elements.map((element) => {
        const Icon = element.icon
        return (
          <div
            key={element.id}
            className="absolute opacity-10 text-blue-400"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
            }}
          >
            <Icon className="w-8 h-8 animate-bounce" />
          </div>
        )
      })}
    </div>
  )
}
