"use client"
import { useAuth } from "@/components/auth-provider"
import { EnhancedSignInAnimated } from "@/components/enhanced-sign-in-animated"
import { EnhancedDashboard } from "@/components/enhanced-dashboard"
import { AdvancedLoadingScreen } from "@/components/advanced-loading-screen"
import { useState } from "react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [showLoader, setShowLoader] = useState(true)

  if (isLoading || showLoader) {
    return <AdvancedLoadingScreen onLoadComplete={() => setShowLoader(false)} />
  }

  return <div className="page-content">{user ? <EnhancedDashboard /> : <EnhancedSignInAnimated />}</div>
}
