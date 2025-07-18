"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, FileAudio, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadSectionProps {
  onFileUpload: (file: File) => void
}

export function UploadSection({ onFileUpload }: UploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  return (
    <section className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Upload Your Audio File</h2>
        <p className="text-slate-300 text-lg">Drag and drop your Tamil or Tanglish audio file, or click to browse</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          "bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20",
          "rounded-3xl p-12 md:p-16 text-center",
          "hover:bg-white/10 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20",
          "transform hover:scale-[1.02] hover:-translate-y-2",
          isDragActive && "bg-white/15 border-purple-400 shadow-2xl shadow-purple-500/30 scale-[1.02] -translate-y-2",
        )}
      >
        <input {...getInputProps()} />

        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="p-4 bg-purple-500/20 rounded-full animate-pulse">
              <FileAudio className="w-8 h-8 text-purple-400" />
            </div>
            <div className="p-4 bg-blue-500/20 rounded-full animate-pulse delay-100">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div className="p-4 bg-pink-500/20 rounded-full animate-pulse delay-200">
              <FileVideo className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white">
              {isDragActive ? "Drop your file here" : "Choose your audio file"}
            </h3>
            <p className="text-slate-300">Supports MP3, MP4, WAV, and other common audio/video formats</p>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="w-5 h-5 mr-2" />
            Browse Files
          </Button>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300">MP3</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300">MP4</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300">WAV</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300">M4A</span>
          </div>
        </div>
      </div>
    </section>
  )
}
