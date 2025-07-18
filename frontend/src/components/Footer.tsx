"use client"

import { Button } from "@/components/ui/button"
import { Github, Mail, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-slate-300">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
            <span>for Tamil speakers</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              onClick={() => window.open("mailto:contact@example.com", "_blank")}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-slate-400">
          <p>&copy; 2024 Tamil Transcription App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
