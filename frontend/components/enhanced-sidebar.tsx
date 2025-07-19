"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import type { ActivePage } from "@/components/enhanced-dashboard"
import { LayoutDashboard, History, FileText, User, LogOut, Menu, Languages, X } from "lucide-react"

interface EnhancedSidebarProps {
  activePage: ActivePage
  onPageChange: (page: ActivePage) => void
}

export function EnhancedSidebar({ activePage, onPageChange }: EnhancedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { logout, user } = useAuth()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const menuItems = [
    { id: "dashboard" as ActivePage, label: "Dashboard", icon: LayoutDashboard, color: "from-blue-500 to-cyan-500" },
    { id: "history" as ActivePage, label: "History", icon: History, color: "from-purple-500 to-pink-500" },
    { id: "summary" as ActivePage, label: "Summary", icon: FileText, color: "from-green-500 to-emerald-500" },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-700/80 transition-all duration-300 shadow-lg"
        size="icon"
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 z-40
          transition-all duration-500 ease-in-out shadow-2xl
          ${isExpanded ? "w-72" : "w-20"}
          lg:w-72
          ${isVisible ? "translate-x-0" : "-translate-x-full"}
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
          <nav className="flex-1 p-4 space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <div
                  key={item.id}
                  className={`transition-all duration-300 delay-${index * 100}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Button
                    onClick={() => onPageChange(item.id)}
                    variant="ghost"
                    className={`
                      w-full justify-start gap-4 h-14 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:scale-105"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
                    )}
                    <Icon
                      className={`h-6 w-6 flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
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
                  </Button>
                </div>
              )
            })}
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            {/* User Info */}
            <div
              className={`p-3 rounded-xl bg-slate-800/50 transition-all duration-300 ${
                isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onPageChange("profile")}
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
            </Button>

            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-4 h-12 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 group"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span
                className={`transition-all duration-300 ${
                  isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"
                }`}
              >
                Logout
              </span>
            </Button>
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
