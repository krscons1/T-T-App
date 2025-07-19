"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Clock } from "lucide-react"

interface HistoryItem {
  id: string
  processName: string
  fileName: string
  createdAt: string
  duration: string
  status: "completed" | "processing" | "failed"
}

interface HistoryContentProps {
  onViewSummary: (id: string) => void
}

export function HistoryContent({ onViewSummary }: HistoryContentProps) {
  // Mock data - in real app, this would come from API
  const historyItems: HistoryItem[] = [
    {
      id: "1",
      processName: "Tamil Speech Sample 1",
      fileName: "recording_001.mp3",
      createdAt: "2024-01-15T10:30:00Z",
      duration: "2:45",
      status: "completed",
    },
    {
      id: "2",
      processName: "Business Meeting Audio",
      fileName: "meeting_audio.wav",
      createdAt: "2024-01-14T15:20:00Z",
      duration: "15:30",
      status: "completed",
    },
    {
      id: "3",
      processName: "Interview Recording",
      fileName: "interview.m4a",
      createdAt: "2024-01-13T09:15:00Z",
      duration: "8:20",
      status: "completed",
    },
    {
      id: "4",
      processName: "Lecture Notes",
      fileName: "lecture_tamil.mp3",
      createdAt: "2024-01-12T14:45:00Z",
      duration: "25:10",
      status: "processing",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-blue-600/20 text-blue-400 border-blue-500/30"
      case "failed":
        return "bg-red-600/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-600/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white neon-text">Translation History</h1>
        <p className="text-slate-400">View and manage your previous translations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-600/20">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-slate-400">Total Translations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-600/20">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-slate-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2h 45m</p>
                <p className="text-sm text-slate-400">Total Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Grid */}
      <div className="grid gap-4">
        {historyItems.map((item) => (
          <Card
            key={item.id}
            className="glass border-slate-700/50 hover:border-blue-500/30 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{item.processName}</h3>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{item.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewSummary(item.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow"
                    disabled={item.status !== "completed"}
                  >
                    View Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {historyItems.length === 0 && (
        <Card className="glass border-slate-700/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No translations yet</h3>
            <p className="text-slate-400">Start by uploading your first Tamil audio file</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
