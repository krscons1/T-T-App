"use client"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, Volume2, Download, Copy, FileText, Calendar, Clock, CheckCircle } from "lucide-react"

interface SummaryContentProps {
  summaryId: string | null
}

export function SummaryContent({ summaryId }: SummaryContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState<"tamil" | "english" | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock data - in real app, this would be fetched based on summaryId
  const summaryData = {
    id: summaryId || "1",
    processName: "Tamil Speech Sample 1",
    fileName: "recording_001.mp3",
    createdAt: "2024-01-15T10:30:00Z",
    duration: "2:45",
    fileSize: "3.2 MB",
    status: "completed",
    tamilText:
      "வணக்கம், இது ஒரு மாதிரி தமிழ் உரை. இந்த ஆடியோ கோப்பு தமிழில் பேசப்பட்டுள்ளது. நாங்கள் செயற்கை நுண்ணறிவு தொழில்நுட்பத்தைப் பயன்படுத்தி இந்த ஆடியோவை உரையாக மாற்றியுள்ளோம். இது மிகவும் துல்லியமான மொழிபெயர்ப்பு சேவையாகும்.",
    englishText:
      "Hello, this is a sample Tamil text. This audio file has been spoken in Tamil. We have converted this audio to text using artificial intelligence technology. This is a very accurate translation service.",
    processingTime: "45 seconds",
    accuracy: "98.5%",
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

  const copyToClipboard = async (text: string, type: "tamil" | "english") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!summaryId) {
    return (
      <div className="p-6">
        <Card className="glass border-slate-700/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No summary selected</h3>
            <p className="text-slate-400">Select a translation from your history to view its summary</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white neon-text">Translation Summary</h1>
        <p className="text-slate-400">Detailed view of your translation process</p>
      </div>

      {/* Process Info */}
      <Card className="glass border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">{summaryData.processName}</CardTitle>
              <CardDescription className="text-slate-400 mt-1">{summaryData.fileName}</CardDescription>
            </div>
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              {summaryData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Created</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{formatDate(summaryData.createdAt)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Duration</p>
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-sm">{summaryData.duration}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Processing Time</p>
              <p className="text-sm text-white">{summaryData.processingTime}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Accuracy</p>
              <p className="text-sm text-green-400 font-semibold">{summaryData.accuracy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <Card className="glass border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-400" />
            Audio Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 glass rounded-lg">
            <Button onClick={toggleAudio} size="icon" className="bg-blue-600 hover:bg-blue-700 neon-glow">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <p className="text-white font-medium">{summaryData.fileName}</p>
              <p className="text-sm text-slate-400">
                {summaryData.fileSize} • {summaryData.duration}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <audio ref={audioRef} src="/placeholder-audio.mp3" />
        </CardContent>
      </Card>

      {/* Transcription and Translation */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Tamil Transcription</CardTitle>
              <Button
                onClick={() => copyToClipboard(summaryData.tamilText, "tamil")}
                variant="outline"
                size="sm"
                className="glass border-slate-600 text-white hover:bg-slate-800/50"
              >
                {copied === "tamil" ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied === "tamil" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summaryData.tamilText}
              readOnly
              className="glass border-slate-600 text-white min-h-40 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="glass border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">English Translation</CardTitle>
              <Button
                onClick={() => copyToClipboard(summaryData.englishText, "english")}
                variant="outline"
                size="sm"
                className="glass border-slate-600 text-white hover:bg-slate-800/50"
              >
                {copied === "english" ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied === "english" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summaryData.englishText}
              readOnly
              className="glass border-slate-600 text-white min-h-40 resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="glass border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as Text
            </Button>
            <Button
              variant="outline"
              className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
