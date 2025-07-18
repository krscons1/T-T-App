"use client"

import { Check, Upload, FileText, Languages, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressFlowProps {
  currentStep: number
  isProcessing: boolean
}

const steps = [
  { id: 0, title: "Upload", icon: Upload, description: "Select your audio file" },
  { id: 1, title: "Transcribe", icon: FileText, description: "Converting speech to text" },
  { id: 2, title: "Translate", icon: Languages, description: "Translating to English" },
  { id: 3, title: "Result", icon: Sparkles, description: "Your translation is ready" },
]

export function ProgressFlow({ currentStep, isProcessing }: ProgressFlowProps) {
  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep >= step.id
            const isCurrent = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex flex-col items-center text-center space-y-3 flex-1">
                <div className="relative">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform",
                      isCompleted && "bg-green-500 shadow-lg shadow-green-500/30",
                      isCurrent && isProcessing && "bg-purple-500 shadow-lg shadow-purple-500/30 animate-pulse",
                      isCurrent && !isProcessing && "bg-blue-500 shadow-lg shadow-blue-500/30",
                      !isActive && "bg-white/10 border-2 border-white/20",
                      isActive && "scale-110",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <Icon
                        className={cn(
                          "w-8 h-8 transition-colors duration-300",
                          isActive ? "text-white" : "text-slate-400",
                        )}
                      />
                    )}
                  </div>

                  {isCurrent && isProcessing && (
                    <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3
                    className={cn(
                      "font-semibold transition-colors duration-300",
                      isActive ? "text-white" : "text-slate-400",
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm transition-colors duration-300",
                      isActive ? "text-slate-300" : "text-slate-500",
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-4"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
