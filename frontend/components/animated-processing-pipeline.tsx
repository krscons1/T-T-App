"use client"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, Upload, Sparkles } from "lucide-react"

interface AnimatedProcessingPipelineProps {
  currentStep: "idle" | "uploaded" | "transcribing" | "translating" | "completed"
  progress: number
}

export function AnimatedProcessingPipeline({ currentStep, progress }: AnimatedProcessingPipelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = [
    { id: "uploaded", label: "File Uploaded", icon: Upload, color: "from-blue-500 to-cyan-500" },
    { id: "transcribing", label: "Neural Transcription", icon: Loader2, color: "from-purple-500 to-pink-500" },
    { id: "translating", label: "AI Translation", icon: Sparkles, color: "from-orange-500 to-red-500" },
    { id: "completed", label: "Process Complete", icon: CheckCircle, color: "from-green-500 to-emerald-500" },
  ]

  useEffect(() => {
    const loadAnime = async () => {
      try {
        const anime = (await import("@/lib/safe-anime")).default
        const animate = anime // alias for brevity

        if (!containerRef.current) return

        steps.forEach((step, idx) => {
          const stepElement = containerRef.current?.querySelector(`[data-step="${step.id}"]`)
          const icon = stepElement?.querySelector(".step-icon")
          const glow = stepElement?.querySelector(".glow-effect")

          const stepIdx = steps.findIndex((s) => s.id === step.id)
          const currentIdx = steps.findIndex((s) => s.id === currentStep)
          const completed = currentIdx > stepIdx
          const active = currentIdx === stepIdx

          // Icon animations
          if (completed && icon) {
            animate({
              targets: icon,
              scale: [1, 1.2, 1.05],
              rotate: [0, 360],
              duration: 800,
              easing: "easeOutBack",
            })
          } else if (active && icon) {
            animate({
              targets: icon,
              scale: [1, 1.1, 1],
              duration: 600,
              easing: "easeOutQuart",
            })

            if (step.id === "transcribing" || step.id === "translating") {
              animate({
                targets: icon,
                rotate: "1turn",
                duration: 2000,
                loop: true,
                easing: "linear",
              })
            }
          }

          // Glow effect for active steps
          if (active && glow) {
            animate({
              targets: glow,
              opacity: [0, 0.6, 0.3],
              scale: [0.8, 1.2, 1],
              loop: true,
              duration: 1000,
              direction: "alternate",
              easing: "easeInOutSine",
            })
          }
        })
      } catch (error) {
        console.log("Animation failed, continuing without animation")
      }
    }

    loadAnime()
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
        <CardTitle className="text-white text-xl">Neural Processing Pipeline</CardTitle>
        <CardDescription className="text-slate-400 text-base">Advanced AI algorithms at work</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const status = getStepStatus(step.id)
            const isActive = status === "active"
            const isCompleted = status === "completed"

            return (
              <div key={step.id} className="flex items-center gap-8" data-step={step.id}>
                <div
                  className={`
                    relative p-4 rounded-2xl transition-all duration-500 transform
                    ${
                      isCompleted
                        ? `bg-gradient-to-r ${step.color} shadow-2xl scale-110`
                        : isActive
                          ? `bg-gradient-to-r ${step.color} shadow-2xl scale-110`
                          : "bg-slate-700 scale-100"
                    }
                  `}
                >
                  {/* Glow effect */}
                  {isActive && (
                    <div
                      className={`glow-effect absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-20`}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={`step-icon h-6 w-6 text-white relative z-10 ${
                      isActive && (step.id === "transcribing" || step.id === "translating") ? "animate-spin" : ""
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      isCompleted ? "text-green-400" : isActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Progress bar for active processing steps */}
                  {isActive && (currentStep === "transcribing" || currentStep === "translating") && (
                    <div className="mt-4 space-y-3">
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`progress-fill h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-300 relative overflow-hidden`}
                          style={{ width: `${progress}%` }}
                        >
                          <div className="progress-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                      </div>
                      <p className="text-slate-400 text-lg">{progress}% complete</p>
                    </div>
                  )}

                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`connecting-line w-px h-12 ml-8 mt-4 transition-all duration-700 ${
                        isCompleted ? "bg-gradient-to-b from-green-500 to-blue-500" : "bg-slate-700"
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
