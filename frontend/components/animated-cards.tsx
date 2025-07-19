"use client"
import { useEffect, useRef } from "react"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Languages } from "lucide-react"

interface AnimatedCardProps {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  delay?: number
}

export function AnimatedCard({ icon: Icon, title, description, gradient, delay = 0 }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Initial entrance animation
        anime({
          targets: cardRef.current,
          translateY: [100, 0],
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 800,
          delay,
          easing: "easeOutBack",
        })
      }
      initAnime()
    }
  }, [delay])

  const handleMouseEnter = () => {
    if (typeof window !== "undefined") {
      const initAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")
        anime({
          targets: cardRef.current,
          translateY: -10,
          scale: 1.05,
          duration: 300,
          easing: "easeOutQuad",
        })
      }
      initAnime()
    }
  }

  const handleMouseLeave = () => {
    if (typeof window !== "undefined") {
      const initAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")
        anime({
          targets: cardRef.current,
          translateY: 0,
          scale: 1,
          duration: 300,
          easing: "easeOutQuad",
        })
      }
      initAnime()
    }
  }

  return (
    <Card
      ref={cardRef}
      className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl cursor-pointer overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnimatedFeatureCards() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process audio in seconds",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays protected",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Languages,
      title: "98.5% Accuracy",
      description: "Professional-grade translation",
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="grid gap-6 max-w-lg mx-auto lg:mx-0">
      {features.map((feature, index) => (
        <AnimatedCard key={feature.title} {...feature} delay={index * 200} />
      ))}
    </div>
  )
}
