"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import { ParticleExplosionButton } from "@/components/particle-explosion-button"
import { AnimatedProcessingPipeline } from "@/components/animated-processing-pipeline"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Play, Pause, Volume2, FileAudio, Sparkles } from "lucide-react"

type ProcessStep = "idle" | "uploaded" | "transcribing" | "translating" | "completed"

export function EnhancedDashboardContent() {
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
    const loadAnime = async () => {
      const anime = (await import("@/lib/safe-anime")).default

      // Complex entrance animation
      if (!containerRef.current) return

      const children = Array.from(containerRef.current.children)
      if (children.length === 0) return

      anime
        .timeline()
        .add({
          targets: children,
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

    // Set a fallback timeout to show content even if animations fail
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true)
      if (containerRef.current) {
        const children = Array.from(containerRef.current.children)
        children.forEach((child: any) => {
          if (child.style) {
            child.style.opacity = "1"
            child.style.transform = "none"
          }
        })
      }
    }, 1000)

    loadAnime().catch(() => {
      // If animation loading fails, just show the content
      setIsVisible(true)
      if (containerRef.current) {
        const children = Array.from(containerRef.current.children)
        children.forEach((child: any) => {
          if (child.style) {
            child.style.opacity = "1"
            child.style.transform = "none"
          }
        })
      }
    })

    return () => clearTimeout(fallbackTimer)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setUploadedFile(file)
      setCurrentStep("uploaded")

      // File upload success animation
      const loadAnime = async () => {
        try {
          const anime = (await import("@/lib/safe-anime")).default

          if (uploadZoneRef.current) {
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
        } catch (error) {
          console.log("Animation failed, continuing without animation")
        }
      }
      loadAnime()
    }
  }

  const startProcessing = async () => {
    if (!uploadedFile || !processName) return

    // Simulate processing steps with enhanced progress
    setCurrentStep("transcribing")
    setProgress(0)

    // Transcribing progress with smooth animation
    for (let i = 0; i <= 100; i += 2) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    setTamilText(
      "வணக்கம், இது ஒரு மாதிரி தமிழ் உரை. இந்த ஆடியோ கோப்பு தமிழில் பேசப்பட்டுள்ளது. நாங்கள் செயற்கை நுண்ணறிவு தொழில்நுட்பத்தைப் பயன்படுத்தி இந்த ஆடியோவை உரையாக மாற்றியுள்ளோம். இது மிகவும் துல்லியமான மொழிபெயர்ப்பு சேவையாகும்.",
    )

    setCurrentStep("translating")
    setProgress(0)

    // Translating progress with smooth animation
    for (let i = 0; i <= 100; i += 3) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }

    setEnglishText(
      "Hello, this is a sample Tamil text. This audio file has been spoken in Tamil. We have converted this audio to text using artificial intelligence technology. This is a very accurate translation service with advanced neural networks and deep learning capabilities.",
    )

    setCurrentStep("completed")
    setProgress(100)

    // Completion celebration
    const loadAnime = async () => {
      try {
        const anime = (await import("@/lib/safe-anime")).default

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
      } catch (error) {
        console.log("Celebration animation failed, continuing without animation")
      }
    }
    loadAnime()
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
      {/* Enhanced Header */}
      <div className="space-y-4 opacity-100">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
            <FileAudio className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Dashboard
            </h1>
            <p className="text-slate-400 text-base">Transform Tamil audio with advanced neural networks</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enhanced Upload Section */}
        <Card className="dashboard-card bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl opacity-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              Neural Audio Processor
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Upload Tamil audio for AI-powered transcription and translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="processName" className="text-slate-300 font-medium text-base">
                Process Name
              </Label>
              <Input
                id="processName"
                placeholder="Enter a descriptive name for this translation"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300 font-medium text-base">Audio File</Label>
              <div
                ref={uploadZoneRef}
                className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-500 group relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium text-lg mb-2">
                      {uploadedFile ? uploadedFile.name : "Drop your audio file here"}
                    </p>
                    <p className="text-slate-500 text-sm">MP3, WAV, M4A up to 50MB</p>
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
        <div className="dashboard-card opacity-100">
          <AnimatedProcessingPipeline currentStep={currentStep} progress={progress} />
        </div>
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
