"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Calendar, Clock, Search, Filter, TrendingUp, Zap, Award } from "lucide-react"

interface HistoryItem {
  id: string
  processName: string
  fileName: string
  createdAt: string
  duration: string
  status: "completed" | "processing" | "failed"
  accuracy: string
}

interface EnhancedHistoryContentProps {
  onViewSummary: (id: string) => void
}

export function EnhancedHistoryContent({ onViewSummary }: EnhancedHistoryContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const historyItems: HistoryItem[] = [
    {
      id: "1",
      processName: "Tamil Speech Sample 1",
      fileName: "recording_001.mp3",
      createdAt: "2024-01-15T10:30:00Z",
      duration: "2:45",
      status: "completed",
      accuracy: "98.5%",
    },
    {
      id: "2",
      processName: "Business Meeting Audio",
      fileName: "meeting_audio.wav",
      createdAt: "2024-01-14T15:20:00Z",
      duration: "15:30",
      status: "completed",
      accuracy: "97.2%",
    },
    {
      id: "3",
      processName: "Interview Recording",
      fileName: "interview.m4a",
      createdAt: "2024-01-13T09:15:00Z",
      duration: "8:20",
      status: "completed",
      accuracy: "99.1%",
    },
    {
      id: "4",
      processName: "Lecture Notes",
      fileName: "lecture_tamil.mp3",
      createdAt: "2024-01-12T14:45:00Z",
      duration: "25:10",
      status: "processing",
      accuracy: "N/A",
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
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const filteredItems = historyItems.filter(
    (item) =>
      item.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div
      className={`p-6 space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Translation History
            </h1>
            <p className="text-slate-400 text-lg">View and manage your previous translations</p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-sm text-slate-400">Total Translations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">8</p>
                <p className="text-sm text-slate-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">2h 45m</p>
                <p className="text-sm text-slate-400">Total Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">98.2%</p>
                <p className="text-sm text-slate-400">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 px-6 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Enhanced History Grid */}
      <div className="grid gap-6">
        {filteredItems.map((item, index) => (
          <Card
            key={item.id}
            className={`bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 transform hover:scale-[1.02] animate-in slide-in-from-bottom`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{item.processName}</h3>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        {item.status === "completed" && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Award className="h-3 w-3 mr-1" />
                            {item.accuracy}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-sm text-slate-400">
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

                <div className="flex gap-3">
                  <Button
                    onClick={() => onViewSummary(item.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={item.status !== "completed"}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    View Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">No translations found</h3>
                <p className="text-slate-400">
                  {searchTerm ? "Try adjusting your search terms" : "Start by uploading your first Tamil audio file"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
