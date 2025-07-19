"use client"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, Upload, Sparkles } from "lucide-react"

interface AnimatedProgressProps {
  currentStep: string
  progress: number
}

export function AnimatedProgress({ currentStep, progress }: AnimatedProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const steps = [
    { id: "uploaded", label: "File Uploaded", icon: Upload, color: "from-blue-500 to-cyan-500" },
    { id: "transcribing", label: "Transcribing", icon: Loader2, color: "from-purple-500 to-pink-500" },
    { id: "translating", label: "Translating", icon: Sparkles, color: "from-orange-500 to-red-500" },
    { id: "completed", label: "Completed", icon: CheckCircle, color: "from-green-500 to-emerald-500" },
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      const anime = require("animejs/lib/anime.es.js").default

      // Animate progress bar
      anime({
        targets: progressBarRef.current,
        width: `${progress}%`,
        duration: 1000,
        easing: "easeOutExpo",
      })

      // Animate step indicators
      steps.forEach((step, index) => {
        const stepElement = containerRef.current?.querySelector(`[data-step="${step.id}"]`)
        if (stepElement) {
          const isActive = step.id === currentStep
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

          if (isActive || isCompleted) {
            anime({
              targets: stepElement,
              scale: [0.8, 1.1, 1],
              duration: 600,
              delay: index * 100,
              easing: "easeOutBack",
            })
          }
        }
      })
    }
  }, [currentStep, progress])

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    if (currentStep === "idle") return "pending"
    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-xl">AI Processing Pipeline</CardTitle>
        <CardDescription className="text-slate-400">Follow your translation progress in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const status = getStepStatus(step.id)

            return (
              <div key={step.id} className="flex items-center gap-6">
                <div
                  data-step={step.id}
                  className={`
                    relative p-4 rounded-full transition-all duration-500 transform
                    ${
                      status === "completed"
                        ? `bg-gradient-to-r ${step.color} shadow-lg`
                        : status === "active"
                          ? `bg-gradient-to-r ${step.color} shadow-lg animate-pulse`
                          : "bg-slate-700"
                    }
                  `}
                >
                  {status === "active" && (
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} animate-ping opacity-20`}
                    ></div>
                  )}
                  <Icon
                    className={`h-6 w-6 text-white relative z-10 ${
                      status === "active" && (step.id === "transcribing" || step.id === "translating")
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      status === "completed"
                        ? "text-green-400"
                        : status === "active"
                          ? "text-blue-400"
                          : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {status === "active" && (currentStep === "transcribing" || currentStep === "translating") && (
                    <div className="mt-2 space-y-2">
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          ref={progressBarRef}
                          className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-300`}
                          style={{ width: "0%" }}
                        />
                      </div>
                      <p className="text-sm text-slate-400">{progress}% complete</p>
                    </div>
                  )}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-px h-12 ml-8 mt-4 transition-colors duration-500 ${
                        status === "completed" ? "bg-gradient-to-b from-green-500 to-blue-500" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
