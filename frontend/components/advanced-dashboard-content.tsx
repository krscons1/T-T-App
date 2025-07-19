"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import { ParticleExplosionButton } from "@/components/particle-explosion-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Play, Pause, Volume2, CheckCircle, Loader2, FileAudio, Sparkles } from "lucide-react"

type ProcessStep = "idle" | "uploaded" | "transcribing" | "translating" | "completed"

export function AdvancedDashboardContent() {
  const [processName, setProcessName] = useState("")
  const [currentStep, setCurrentStep] = useState<ProcessStep>("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [tamilText, setTamilText] = useState("")
  const [englishText, setEnglishText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const uploadZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const anime = require("animejs").default

      // Complex entrance animation
      anime
        .timeline()
        .add({
          targets: containerRef.current?.children,
          translateY: [100, 0],
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 1000,
          delay: anime.stagger(200),
          easing: "easeOutBack",
        })
        .add(
          {
            targets: ".dashboard-card",
            rotateY: [90, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: "easeOutExpo",
          },
          "-=800",
        )

      setIsVisible(true)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setUploadedFile(file)
      setCurrentStep("uploaded")

      // File upload success animation
      if (typeof window !== "undefined" && uploadZoneRef.current) {
        const anime = require("animejs/lib/anime.es.js").default

        anime
          .timeline()
          .add({
            targets: uploadZoneRef.current,
            scale: [1, 1.05, 1],
            duration: 600,
            easing: "easeOutBack",
          })
          .add(
            {
              targets: uploadZoneRef.current,
              backgroundColor: ["rgba(59, 130, 246, 0.1)", "rgba(34, 197, 94, 0.1)"],
              borderColor: ["rgb(59, 130, 246)", "rgb(34, 197, 94)"],
              duration: 400,
              easing: "easeOutQuart",
            },
            "-=300",
          )
      }
    }
  }

  const startProcessing = async () => {
    if (!uploadedFile || !processName) return

    if (typeof window !== "undefined") {
      const anime = require("animejs/lib/anime.es.js").default

      // Processing start animation
      anime({
        targets: ".processing-indicator",
        rotate: "1turn",
        duration: 2000,
        loop: true,
        easing: "linear",
      })
    }

    // Simulate processing steps with enhanced progress
    setCurrentStep("transcribing")
    setProgress(0)

    // Transcribing progress with morphing animation
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 80))
    }

    setTamilText(
      "வணக்கம், இது ஒரு மாதிரி தமிழ் உரை. இந்த ஆடியோ கோப்பு தமிழில் பேசப்பட்டுள்ளது. நாங்கள் செயற்கை நுண்ணறிவு தொழில்நுட்பத்தைப் பயன்படுத்தி இந்த ஆடியோவை உரையாக மாற்றியுள்ளோம். இது மிகவும் துல்லியமான மொழிபெயர்ப்பு சேவையாகும்.",
    )

    setCurrentStep("translating")
    setProgress(0)

    // Translating progress with particle effects
    for (let i = 0; i <= 100; i += 8) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }

    setEnglishText(
      "Hello, this is a sample Tamil text. This audio file has been spoken in Tamil. We have converted this audio to text using artificial intelligence technology. This is a very accurate translation service with advanced neural networks and deep learning capabilities.",
    )

    setCurrentStep("completed")
    setProgress(100)

    // Completion celebration
    if (typeof window !== "undefined" && containerRef.current) {
      const anime = require("animejs/lib/anime.es.js").default

      // Create celebration particles
      const particleCount = 50
      const particles = Array.from({ length: particleCount }, (_, i) => {
        const particle = document.createElement("div")
        particle.style.cssText = `
          position: fixed;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          pointer-events: none;
          z-index: 1000;
        `
        document.body.appendChild(particle)
        return particle
      })

      anime({
        targets: particles,
        translateX: () => anime.random(-400, 400),
        translateY: () => anime.random(-400, 400),
        scale: [1, 0],
        opacity: [1, 0],
        rotate: () => anime.random(0, 720),
        duration: 2000,
        easing: "easeOutExpo",
        complete: () => {
          particles.forEach((p) => p.remove())
        },
      })
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`p-6 space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* Enhanced Header with Morphing Elements */}
      <div className="space-y-4 opacity-0">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
            <FileAudio className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Dashboard
            </h1>
            <p className="text-slate-400 text-xl">Transform Tamil audio with advanced neural networks</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enhanced Upload Section */}
        <Card className="dashboard-card bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl opacity-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              Neural Audio Processor
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Upload Tamil audio for AI-powered transcription and translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="processName" className="text-slate-300 font-medium text-lg">
                Process Name
              </Label>
              <Input
                id="processName"
                placeholder="Enter a descriptive name for this translation"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="h-14 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300 font-medium text-lg">Audio File</Label>
              <div
                ref={uploadZoneRef}
                className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-500 group relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium text-xl mb-2">
                      {uploadedFile ? uploadedFile.name : "Drop your audio file here"}
                    </p>
                    <p className="text-slate-500 text-lg">MP3, WAV, M4A up to 50MB</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            {uploadedFile && (
              <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-6 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                  <ParticleExplosionButton
                    onClick={toggleAudio}
                    size="icon"
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </ParticleExplosionButton>
                  <div className="flex-1">
                    <p className="text-white font-medium text-lg">{uploadedFile.name}</p>
                    <p className="text-slate-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Volume2 className="h-8 w-8 text-slate-400" />
                </div>
                <audio ref={audioRef} src={URL.createObjectURL(uploadedFile)} />
              </div>
            )}

            <ParticleExplosionButton
              onClick={startProcessing}
              disabled={!uploadedFile || !processName || currentStep !== "uploaded"}
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Activate Neural Translation
            </ParticleExplosionButton>
          </CardContent>
        </Card>

        {/* Enhanced Progress Tracker */}
        <Card className="dashboard-card bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl opacity-0">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Neural Processing Pipeline</CardTitle>
            <CardDescription className="text-slate-400 text-lg">Advanced AI algorithms at work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-10">
              {[
                { id: "uploaded", label: "File Uploaded", icon: Upload, color: "from-blue-500 to-cyan-500" },
                {
                  id: "transcribing",
                  label: "Neural Transcription",
                  icon: Loader2,
                  color: "from-purple-500 to-pink-500",
                },
                { id: "translating", label: "AI Translation", icon: Sparkles, color: "from-orange-500 to-red-500" },
                {
                  id: "completed",
                  label: "Process Complete",
                  icon: CheckCircle,
                  color: "from-green-500 to-emerald-500",
                },
              ].map((step, index) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted =
                  ["uploaded", "transcribing", "translating", "completed"].indexOf(currentStep) > index

                return (
                  <div key={step.id} className="flex items-center gap-8">
                    <div
                      className={`
                        relative p-6 rounded-2xl transition-all duration-500 transform
                        ${
                          isCompleted
                            ? `bg-gradient-to-r ${step.color} shadow-2xl scale-110`
                            : isActive
                              ? `bg-gradient-to-r ${step.color} shadow-2xl scale-110 animate-pulse`
                              : "bg-slate-700 scale-100"
                        }
                      `}
                    >
                      {isActive && (
                        <div
                          className={`processing-indicator absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} animate-ping opacity-20`}
                        ></div>
                      )}
                      <Icon
                        className={`h-8 w-8 text-white relative z-10 ${
                          isActive && (step.id === "transcribing" || step.id === "translating") ? "animate-spin" : ""
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-2xl ${
                          isCompleted ? "text-green-400" : isActive ? "text-blue-400" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isActive && (currentStep === "transcribing" || currentStep === "translating") && (
                        <div className="mt-4 space-y-3">
                          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-300 relative overflow-hidden`}
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          <p className="text-slate-400 text-lg">{progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Results */}
      {(tamilText || englishText) && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom duration-700">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                  <FileAudio className="h-6 w-6 text-white" />
                </div>
                Tamil Neural Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tamilText}
                readOnly
                className="min-h-48 bg-slate-700/30 border-slate-600 text-white resize-none focus:ring-orange-500/20 focus:border-orange-500 text-lg"
                placeholder="Tamil transcription will appear here..."
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                English AI Translation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={englishText}
                readOnly
                className="min-h-48 bg-slate-700/30 border-slate-600 text-white resize-none focus:ring-green-500/20 focus:border-green-500 text-lg"
                placeholder="English translation will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
