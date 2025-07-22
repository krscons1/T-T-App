"use client"
import { useState, useEffect } from "react"
import { EnhancedSidebar } from "@/components/enhanced-sidebar"
import { EnhancedDashboardContent } from "@/components/enhanced-dashboard-content"
import { EnhancedHistoryContent } from "@/components/enhanced-history-content"
import { EnhancedSummaryContent } from "@/components/enhanced-summary-content"
import { EnhancedProfileContent } from "@/components/enhanced-profile-content"
import { AnimatedBackground } from "@/components/animated-background"
import { PageLoader } from "@/components/page-loader"

export type ActivePage = "dashboard" | "history" | "summary" | "profile"

export function EnhancedDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <EnhancedDashboardContent />
      case "history":
        return (
          <EnhancedHistoryContent
            onViewSummary={(id) => {
              setSelectedSummary(id)
              setActivePage("summary")
            }}
          />
        )
      case "summary":
        return <EnhancedSummaryContent summaryId={selectedSummary} />
      case "profile":
        return <EnhancedProfileContent />
      default:
        return <EnhancedDashboardContent />
    }
  }

  if (isLoading) {
    return <PageLoader onLoadComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div
        className={`relative z-10 min-h-screen flex transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        <EnhancedSidebar activePage={activePage} onPageChange={setActivePage} />

        {/* Main Content Area - Centered with fixed sidebar */}
        <main className="flex-1 pl-72 transition-all duration-500 ease-in-out relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm"></div>

          {/* Centered Content Container */}
          <div className="relative z-10 min-h-screen flex items-start justify-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
