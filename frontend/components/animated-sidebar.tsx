"use client"
import { useState, useEffect, useRef } from "react"
import { AnimatedButton } from "@/components/animated-button"
import { useAuth } from "@/components/auth-provider"
import type { ActivePage } from "@/components/enhanced-dashboard"
import { LayoutDashboard, History, FileText, User, LogOut, Menu, Languages, X } from "lucide-react"

interface AnimatedSidebarProps {
  activePage: ActivePage
  onPageChange: (page: ActivePage) => void
}

export function AnimatedSidebar({ activePage, onPageChange }: AnimatedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)
  const { logout, user } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initializeAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Sidebar entrance animation
        anime({
          targets: sidebarRef.current,
          translateX: [-300, 0],
          opacity: [0, 1],
          duration: 800,
          easing: "easeOutExpo",
          delay: 300,
        })

        // Menu items stagger animation
        anime({
          targets: menuItemsRef.current?.children,
          translateX: [-50, 0],
          opacity: [0, 1],
          duration: 600,
          delay: anime.stagger(100, { start: 800 }),
          easing: "easeOutExpo",
        })

        setIsVisible(true)
      }

      initializeAnime()
    }
  }, [])

  const menuItems = [
    { id: "dashboard" as ActivePage, label: "Dashboard", icon: LayoutDashboard, color: "from-blue-500 to-cyan-500" },
    { id: "history" as ActivePage, label: "History", icon: History, color: "from-purple-500 to-pink-500" },
    { id: "summary" as ActivePage, label: "Summary", icon: FileText, color: "from-green-500 to-emerald-500" },
  ]

  const handleMenuClick = (pageId: ActivePage) => {
    if (typeof window !== "undefined") {
      const initializeAnime = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Page transition animation
        anime({
          targets: ".page-content",
          opacity: [1, 0],
          translateY: [0, 20],
          duration: 300,
          easing: "easeOutQuad",
          complete: () => {
            onPageChange(pageId)
            anime({
              targets: ".page-content",
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 500,
              easing: "easeOutExpo",
            })
          },
        })
      }
      initializeAnime()
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <AnimatedButton
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-700/80"
        size="icon"
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </AnimatedButton>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 z-40
          transition-all duration-500 ease-in-out shadow-2xl
          ${isExpanded ? "w-72" : "w-20"}
          lg:w-72
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 animate-pulse"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <Languages className="h-7 w-7 text-white" />
                </div>
              </div>
              <div
                className={`transition-all duration-300 ${
                  isExpanded || window.innerWidth >= 1024
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 lg:opacity-100 lg:translate-x-0"
                }`}
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Tamil Translator
                </h2>
                <p className="text-xs text-slate-400 mt-1">AI-Powered Translation</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div ref={menuItemsRef} className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                const isActive = activePage === item.id

                return (
                  <div key={item.id} className="opacity-0">
                    <AnimatedButton
                      onClick={() => handleMenuClick(item.id)}
                      variant="ghost"
                      className={`
                        w-full justify-start gap-4 h-14 rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
                      )}
                      <Icon className="h-6 w-6 flex-shrink-0" />
                      <span
                        className={`font-medium transition-all duration-300 ${
                          isExpanded || window.innerWidth >= 1024
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4 lg:opacity-100 lg:translate-x-0"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    </AnimatedButton>
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            <AnimatedButton
              onClick={() => handleMenuClick("profile")}
              variant="ghost"
              className={`
                w-full justify-start gap-4 h-12 rounded-xl transition-all duration-300 group
                ${
                  activePage === "profile"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 ${
                  isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"
                }`}
              >
                Profile
              </span>
            </AnimatedButton>

            <AnimatedButton
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-4 h-12 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 group"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 ${
                  isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"
                }`}
              >
                Logout
              </span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}
