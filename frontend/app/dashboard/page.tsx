"use client"
import { useAuth } from "@/components/auth-provider"
import { EnhancedSidebar } from "@/components/enhanced-sidebar"
import { EnhancedDashboardContent } from "@/components/enhanced-dashboard-content"
import { AnimatedBackground } from "@/components/animated-background"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined' && !isLoading && !user) {
      window.location.href = "/"
    }
  }, [user, isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex">
        <EnhancedSidebar activePage="dashboard" />
        <main className="flex-1 pl-72 transition-all duration-500 ease-in-out relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm"></div>
          <div className="relative z-10 min-h-screen flex items-start justify-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <EnhancedDashboardContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
