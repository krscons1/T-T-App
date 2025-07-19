"use client"
import { useEffect, useRef } from "react"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Languages, Sparkles, Cpu, Globe } from "lucide-react"

interface AdvancedCardProps {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  delay?: number
  index: number
}

export function AdvancedInteractiveCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
  index,
}: AdvancedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Complex entrance animation
        anime
          .timeline()
          .add({
            targets: cardRef.current,
            translateY: [100, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            rotate: [5, 0],
            duration: 1000,
            delay,
            easing: "easeOutBack",
          })
          .add(
            {
              targets: contentRef.current?.children,
              translateX: [-30, 0],
              opacity: [0, 1],
              duration: 600,
              delay: anime.stagger(100),
              easing: "easeOutExpo",
            },
            "-=500",
          )
      }
      loadAnime()
    }
  }, [delay])

  const handleMouseEnter = async () => {
    if (typeof window !== "undefined") {
      const { default: anime } = await import("@/lib/safe-anime")

      anime
        .timeline()
        .add({
          targets: cardRef.current,
          translateY: -20,
          rotateX: 10,
          rotateY: 5,
          scale: 1.05,
          duration: 400,
          easing: "easeOutQuart",
        })
        .add(
          {
            targets: glowRef.current,
            opacity: [0, 1],
            scale: [0.8, 1.2],
            duration: 300,
            easing: "easeOutQuart",
          },
          "-=300",
        )
        .add(
          {
            targets: contentRef.current?.querySelector(".icon"),
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            duration: 600,
            easing: "easeOutBack",
          },
          "-=400",
        )
    }
  }

  const handleMouseLeave = async () => {
    if (typeof window !== "undefined") {
      const { default: anime } = await import("@/lib/safe-anime")

      anime
        .timeline()
        .add({
          targets: cardRef.current,
          translateY: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 400,
          easing: "easeOutQuart",
        })
        .add(
          {
            targets: glowRef.current,
            opacity: [1, 0],
            scale: [1.2, 0.8],
            duration: 300,
            easing: "easeOutQuart",
          },
          "-=300",
        )
        .add(
          {
            targets: contentRef.current?.querySelector(".icon"),
            rotate: [360, 0],
            scale: [1, 1],
            duration: 400,
            easing: "easeOutQuart",
          },
          "-=400",
        )
    }
  }

  const handleClick = async () => {
    if (typeof window !== "undefined") {
      const { default: anime } = await import("@/lib/safe-anime")

      // Ripple effect
      const ripple = document.createElement("div")
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        margin-top: -50px;
        pointer-events: none;
      `

      cardRef.current?.appendChild(ripple)

      anime({
        targets: ripple,
        scale: [0, 4],
        opacity: [0.3, 0],
        duration: 600,
        easing: "easeOutQuart",
        complete: () => ripple.remove(),
      })

      // Card pulse
      anime({
        targets: cardRef.current,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: "easeOutQuart",
      })
    }
  }

  return (
    <div className="relative">
      <div
        ref={glowRef}
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur-xl opacity-0 transition-opacity duration-300`}
      />
      <Card
        ref={cardRef}
        className="relative bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl cursor-pointer overflow-hidden transform-gpu"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ transformStyle: "preserve-3d" }}
      >
        <CardContent ref={contentRef} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`icon p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-lg opacity-0">{title}</h3>
              <p className="text-slate-400 text-sm opacity-0">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdvancedInteractiveCards() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process audio in seconds with AI acceleration",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption for your data",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Languages,
      title: "98.5% Accuracy",
      description: "Professional-grade neural translation",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced machine learning algorithms",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Cpu,
      title: "Real-time Processing",
      description: "Instant translation as you speak",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with Tamil speakers worldwide",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <AdvancedInteractiveCard key={feature.title} {...feature} index={index} delay={index * 150} />
      ))}
    </div>
  )
}
