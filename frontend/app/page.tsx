"use client"
import { useAuth } from "@/components/auth-provider"
import { EnhancedSignInAnimated } from "@/components/enhanced-sign-in-animated"
import { AdvancedLoadingScreen } from "@/components/advanced-loading-screen"
import { useState, useEffect } from "react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [showLoader, setShowLoader] = useState(true)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined' && !isLoading && user) {
      window.location.href = "/dashboard"
    }
  }, [user, isLoading])

  // Handle loader completion
  const handleLoaderComplete = () => {
    // Use a small delay to ensure smooth transition
    setTimeout(() => {
      setShowLoader(false)
      // Show sign-in form after loader completes
      setShowSignIn(true)
    }, 300)
  }

  if (isLoading || showLoader) {
    return <AdvancedLoadingScreen onLoadComplete={handleLoaderComplete} />
  }

  return (
    <div className="page-content w-full min-h-screen relative z-10">
      {showSignIn && <EnhancedSignInAnimated />}
    </div>
  )
}
