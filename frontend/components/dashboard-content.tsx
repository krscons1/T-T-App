"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Play, Pause, Volume2, CheckCircle, Loader2 } from "lucide-react"

type ProcessStep = "idle" | "uploaded" | "transcribing" | "translating" | "completed"

export function DashboardContent() {
  const [processName, setProcessName] = useState("")
  const [currentStep, setCurrentStep] = useState<ProcessStep>("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [tamilText, setTamilText] = useState("")
  const [englishText, setEnglishText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const steps = [
    { id: "uploaded", label: "File Uploaded", icon: Upload },
    { id: "transcribing", label: "Transcribing", icon: Loader2 },
    { id: "translating", label: "Translating", icon: Loader2 },
    { id: "completed", label: "Completed", icon: CheckCircle },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setUploadedFile(file)
      setCurrentStep("uploaded")
    }
  }

  const startProcessing = async () => {
    if (!uploadedFile || !processName) return

    // Simulate processing steps
    setCurrentStep("transcribing")
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setTamilText("வணக்கம், இது ஒரு மாதிரி தமிழ் உரை. இந்த ஆடியோ கோப்பு தமிழில் பேசப்பட்டுள்ளது.")

    setCurrentStep("translating")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setEnglishText("Hello, this is a sample Tamil text. This audio file has been spoken in Tamil.")
    setCurrentStep("completed")
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

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    if (currentStep === "idle") return "pending"
    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white neon-text">Dashboard</h1>
        <p className="text-slate-400">Upload and translate your Tamil audio files</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="glass border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload Audio
            </CardTitle>
            <CardDescription className="text-slate-400">Select a Tamil audio file to begin translation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="processName" className="text-slate-300">
                Process Name
              </Label>
              <Input
                id="processName"
                placeholder="Enter a name for this translation"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="glass border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Audio File</Label>
              <div
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">{uploadedFile ? uploadedFile.name : "Click to upload audio file"}</p>
                <p className="text-sm text-slate-500">MP3, WAV, M4A up to 50MB</p>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            {uploadedFile && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 glass rounded-lg">
                  <Button onClick={toggleAudio} size="icon" className="bg-blue-600 hover:bg-blue-700">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Volume2 className="h-5 w-5 text-slate-400" />
                </div>
                <audio ref={audioRef} src={URL.createObjectURL(uploadedFile)} />
              </div>
            )}

            <Button
              onClick={startProcessing}
              disabled={!uploadedFile || !processName || currentStep !== "uploaded"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow"
            >
              Start Translation
            </Button>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="glass border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Progress Tracker</CardTitle>
            <CardDescription className="text-slate-400">Follow your translation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                const status = getStepStatus(step.id)

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div
                      className={`
                      p-3 rounded-full transition-all duration-500
                      ${
                        status === "completed"
                          ? "bg-green-600 neon-glow"
                          : status === "active"
                            ? "bg-blue-600 pulse-glow"
                            : "bg-slate-700"
                      }
                    `}
                    >
                      <Icon className={`h-5 w-5 text-white ${status === "active" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          status === "completed"
                            ? "text-green-400"
                            : status === "active"
                              ? "text-blue-400"
                              : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-px h-8 ml-6 mt-2 ${status === "completed" ? "bg-green-600" : "bg-slate-700"}`}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {(tamilText || englishText) && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Tamil Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tamilText}
                readOnly
                className="glass border-slate-600 text-white min-h-32 resize-none"
                placeholder="Tamil transcription will appear here..."
              />
            </CardContent>
          </Card>

          <Card className="glass border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">English Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={englishText}
                readOnly
                className="glass border-slate-600 text-white min-h-32 resize-none"
                placeholder="English translation will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
