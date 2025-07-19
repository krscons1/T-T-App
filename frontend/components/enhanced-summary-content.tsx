"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Volume2,
  Download,
  Copy,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Award,
  Share,
  Sparkles,
} from "lucide-react"

interface EnhancedSummaryContentProps {
  summaryId: string | null
}

export function EnhancedSummaryContent({ summaryId }: EnhancedSummaryContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState<"tamil" | "english" | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
      "வணக்கம், இது ஒரு மாதிரி தமிழ் உரை. இந்த ஆடியோ கோப்பு தமிழில் பேசப்பட்டுள்ளது. நாங்கள் செயற்கை நுண்ணறிவு தொழில்நுட்பத்தைப் பயன்படுத்தி இந்த ஆடியோவை உரையாக மாற்றியுள்ளோம். இது மிகவும் துல்லியமான மொழிபெயர்ப்பு சேவையாகும். எங்கள் AI தொழில்நுட்பம் உயர்ந்த தரத்தில் மொழிபெயர்ப்பை வழங்குகிறது.",
    englishText:
      "Hello, this is a sample Tamil text. This audio file has been spoken in Tamil. We have converted this audio to text using artificial intelligence technology. This is a very accurate translation service. Our AI technology provides high-quality translation with advanced natural language processing capabilities.",
    processingTime: "45 seconds",
    accuracy: "98.5%",
    confidence: "High",
    wordCount: 156,
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
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">No summary selected</h3>
                <p className="text-slate-400">Select a translation from your history to view its detailed summary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`p-6 space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Translation Summary
            </h1>
            <p className="text-slate-400 text-lg">Detailed analysis of your translation process</p>
          </div>
        </div>
      </div>

      {/* Enhanced Process Info */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                {summaryData.processName}
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">{summaryData.fileName}</CardDescription>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              {summaryData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Created</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{formatDate(summaryData.createdAt)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Duration</p>
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-sm">{summaryData.duration}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Processing Time</p>
              <p className="text-sm text-white font-semibold">{summaryData.processingTime}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-medium">Accuracy</p>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <p className="text-sm text-green-400 font-bold">{summaryData.accuracy}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Audio Player */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            Audio Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 p-6 bg-slate-700/30 rounded-xl border border-slate-600/50">
            <Button
              onClick={toggleAudio}
              size="icon"
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <div className="flex-1 space-y-2">
              <p className="text-white font-semibold text-lg">{summaryData.fileName}</p>
              <p className="text-sm text-slate-400">
                {summaryData.fileSize} • {summaryData.duration} • {summaryData.wordCount} words
              </p>
              <Progress value={35} className="h-2" />
            </div>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <audio ref={audioRef} src="/placeholder-audio.mp3" />
        </CardContent>
      </Card>

      {/* Enhanced Transcription and Translation */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Tamil Transcription
              </CardTitle>
              <Button
                onClick={() => copyToClipboard(summaryData.tamilText, "tamil")}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
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
              className="min-h-48 bg-slate-700/30 border-slate-600 text-white resize-none focus:ring-orange-500/20 focus:border-orange-500"
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
              <span>Confidence: {summaryData.confidence}</span>
              <span>•</span>
              <span>Words: {summaryData.wordCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                English Translation
              </CardTitle>
              <Button
                onClick={() => copyToClipboard(summaryData.englishText, "english")}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
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
              className="min-h-48 bg-slate-700/30 border-slate-600 text-white resize-none focus:ring-green-500/20 focus:border-green-500"
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
              <span>Accuracy: {summaryData.accuracy}</span>
              <span>•</span>
              <span>Quality: Excellent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Actions */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-xl">Export & Share</CardTitle>
          <CardDescription className="text-slate-400">
            Export your translation in various formats or share with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as Text
            </Button>
            <Button
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
