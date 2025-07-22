"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { LayoutDashboard, History, FileText, User, LogOut, Languages } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type ActivePage = "dashboard" | "history" | "summary" | "profile"

interface EnhancedSidebarProps {
  activePage: ActivePage
}

export function EnhancedSidebar({ activePage }: EnhancedSidebarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { logout, user } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const menuItems = [
    {
      id: "dashboard" as ActivePage,
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard",
    },
    {
      id: "history" as ActivePage,
      label: "History",
      icon: History,
      color: "from-purple-500 to-pink-500",
      href: "/history",
    },
    {
      id: "summary" as ActivePage,
      label: "Summary",
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      href: "/summary",
    },
    {
      id: "profile" as ActivePage,
      label: "Profile",
      icon: User,
      color: "from-indigo-500 to-purple-500",
      href: "/profile",
    },
  ]

  return (
    <>
      {/* Sidebar - Always Expanded */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 z-40
          transition-all duration-500 ease-in-out shadow-2xl w-72
          ${isVisible ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <Link href="/dashboard" className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 animate-pulse"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <Languages className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Tamil Translator
                </h2>
                <p className="text-xs text-slate-400 mt-1">AI-Powered Translation</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <div
                  key={item.id}
                  className={`transition-all duration-300 delay-${index * 100}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link href={item.href}>
                    <Button
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
                      <span className="font-medium">{item.label}</span>
                      {isActive && <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            {/* User Info */}
            <div className="p-3 rounded-xl bg-slate-800/50">
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

            {/* Logout Button */}
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-4 h-12 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 group"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
