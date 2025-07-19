"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import type { ActivePage } from "@/components/dashboard"
import { LayoutDashboard, History, FileText, User, LogOut, Menu, Languages } from "lucide-react"

interface SidebarProps {
  activePage: ActivePage
  onPageChange: (page: ActivePage) => void
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { logout, user } = useAuth()

  const menuItems = [
    { id: "dashboard" as ActivePage, label: "Dashboard", icon: LayoutDashboard },
    { id: "history" as ActivePage, label: "History", icon: History },
    { id: "summary" as ActivePage, label: "Summary", icon: FileText },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed top-4 left-4 z-50 glass border-slate-600"
        size="icon"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40
        transition-all duration-300 ease-in-out
        ${isExpanded ? "w-64" : "w-20"}
        lg:w-64
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 neon-glow">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div
                className={`transition-opacity duration-300 ${isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
              >
                <h2 className="text-xl font-bold text-white">Tamil Translator</h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <Button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  variant="ghost"
                  className={`
                    w-full justify-start gap-3 h-12 transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 neon-glow"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`transition-opacity duration-300 ${isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
                  >
                    {item.label}
                  </span>
                </Button>
              )
            })}
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <Button
              onClick={() => onPageChange("profile")}
              variant="ghost"
              className={`
                w-full justify-start gap-3 h-12 transition-all duration-300
                ${
                  activePage === "profile"
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 neon-glow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
              >
                Profile
              </span>
            </Button>

            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${isExpanded || window.innerWidth >= 1024 ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
              >
                Logout
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isExpanded && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsExpanded(false)} />}
    </>
  )
}
