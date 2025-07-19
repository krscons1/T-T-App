"use client"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { HistoryContent } from "@/components/history-content"
import { SummaryContent } from "@/components/summary-content"
import { ProfileContent } from "@/components/profile-content"

export type ActivePage = "dashboard" | "history" | "summary" | "profile"

export function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null)

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardContent />
      case "history":
        return (
          <HistoryContent
            onViewSummary={(id) => {
              setSelectedSummary(id)
              setActivePage("summary")
            }}
          />
        )
      case "summary":
        return <SummaryContent summaryId={selectedSummary} />
      case "profile":
        return <ProfileContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">{renderContent()}</main>
    </div>
  )
}
