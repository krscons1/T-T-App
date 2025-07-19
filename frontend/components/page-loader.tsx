"use client"
import { useEffect, useState } from "react"
import { Languages, Loader2 } from "lucide-react"

interface PageLoaderProps {
  onLoadComplete?: () => void
}

export function PageLoader({ onLoadComplete }: PageLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setIsVisible(false)
            onLoadComplete?.()
          }, 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(timer)
  }, [onLoadComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-8">
        {/* Logo Animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
          </div>
          <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center animate-pulse">
            <Languages className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white animate-pulse">Tamil Translator</h2>
          <p className="text-slate-400 animate-pulse">Loading your translation workspace...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2">{Math.round(progress)}%</p>
        </div>

        {/* Loading Spinner */}
        <Loader2 className="w-6 h-6 mx-auto text-blue-400 animate-spin" />
      </div>
    </div>
  )
}
