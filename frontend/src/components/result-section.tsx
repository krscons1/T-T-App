"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Share2, Play, Pause, RotateCcw, CheckCircle } from "lucide-react"

// Add a helper to format seconds as mm:ss
function formatTime(seconds: number | undefined) {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface ResultSectionProps {
  file: File | null
  transcription: any // Accepts array or string
  translation: string
  currentStep: number
  isProcessing: boolean
  onReset: () => void
}

export function ResultSection({
  file,
  transcription,
  translation,
  currentStep,
  isProcessing,
  onReset,
}: ResultSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control audio playback
  }

  const handleDownload = () => {
    const content = `Original Transcription:\n${transcription}\n\nEnglish Translation:\n${translation}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Tamil to English Translation",
        text: `Original: ${transcription}\n\nTranslation: ${translation}`,
      })
    }
  }

  if (currentStep === 0) return null

  return (
    <section className="max-w-6xl mx-auto space-y-8">
      {/* File Info Card */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{file?.name}</h3>
              <p className="text-sm text-slate-400 font-normal">
                {file && `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type}`}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {currentStep >= 1 && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="translation" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger
                  value="translation"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  English Translation
                </TabsTrigger>
                <TabsTrigger
                  value="transcription"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Original Transcript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="translation" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                    {currentStep >= 3 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400 mb-3">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Translation Complete</span>
                        </div>
                        <p className="text-white text-lg leading-relaxed">{translation}</p>
                      </div>
                    ) : currentStep === 2 ? (
                      <div className="flex items-center gap-3 text-purple-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                        <span>Translating to English...</span>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <span>Waiting for transcription to complete...</span>
                      </div>
                    )}
                  </div>

                  {currentStep >= 3 && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleCopy(translation, "translation")}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {copiedText === "translation" ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedText === "translation" ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="transcription" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
                    {currentStep >= 2 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400 mb-3">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Transcription Complete</span>
                        </div>
                        <div className="text-white text-lg leading-relaxed flex flex-wrap gap-y-2">
                          {Array.isArray(transcription) && transcription.length > 0 ? (
                            transcription.map((seg, idx) => (
                              <span
                                key={idx}
                                title={`Start: ${formatTime(seg.start)} | End: ${formatTime(seg.end)}${seg.speaker ? ` | Speaker: ${seg.speaker}` : ''}`}
                                className="hover:underline cursor-pointer px-1 py-0.5 rounded transition-colors duration-200 hover:bg-blue-900/40"
                                style={{ marginRight: 4, display: 'inline-block' }}
                              >
                                <span className="text-purple-300 mr-1">[{formatTime(seg.start)} - {formatTime(seg.end)}]</span>
                                {seg.speaker ? <span className="font-bold text-blue-300 mr-1">[{seg.speaker}]</span> : null}
                                {seg.text + ' '}
                              </span>
                            ))
                          ) : (
                            <span>{typeof transcription === 'string' ? transcription : ''}</span>
                          )}
                        </div>
                      </div>
                    ) : currentStep === 1 ? (
                      <div className="flex items-center gap-3 text-blue-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <span>Transcribing audio...</span>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <span>Waiting for file upload...</span>
                      </div>
                    )}
                  </div>

                  {currentStep >= 2 && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleCopy(transcription, "transcription")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        {copiedText === "transcription" ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedText === "transcription" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
