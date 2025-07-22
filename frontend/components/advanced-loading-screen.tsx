"use client"

import { useEffect, useRef, useState } from "react"
import { MorphingLogo } from "@/components/morphing-logo"

interface AdvancedLoadingScreenProps {
  onLoadComplete?: () => void
}

export function AdvancedLoadingScreen({ onLoadComplete }: AdvancedLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Initializing")
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const loadingStages = [
    "Initializing AI Engine",
    "Loading Neural Networks",
    "Calibrating Audio Processors",
    "Optimizing Translation Models",
    "Finalizing Setup",
  ]

  useEffect(() => {
    // Run everything in an async IIFE so we can await the module
    const initAnimations = async () => {
      try {
        const module = await import("@/lib/safe-anime")
        const safeAnime = module.default

        // 1. Container entrance animation
        try {
          safeAnime({
            targets: containerRef.current,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 1000,
            easing: "easeOutBack",
          })
        } catch (error) {
          console.error("Error in container entrance animation:", error)
          // Apply fallback CSS animation if needed
          if (containerRef.current) {
            containerRef.current.style.opacity = "1"
            containerRef.current.style.transform = "scale(1)"
          }
        }

        // Function declarations for exitAnimation and createBackgroundParticles
        function exitAnimation() {
          try {
            // Simple fade out animation using direct style manipulation
            if (containerRef.current) {
              // Apply CSS transition
              containerRef.current.style.transition = "opacity 1s ease, transform 1s ease";
              containerRef.current.style.opacity = "0";
              containerRef.current.style.transform = "scale(1.1)";
              
              // Wait for animation to complete with a slightly longer duration
              setTimeout(() => {
                // Ensure the container is removed from the DOM
                if (containerRef.current) {
                  containerRef.current.style.display = "none";
                }
                // Call the completion callback
                onLoadComplete?.();
              }, 1000);
            } else {
              // If no container, just complete
              onLoadComplete?.();
            }
          } catch (error) {
            console.error("Error in exit animation:", error);
            // Still call onLoadComplete even if animation fails
            setTimeout(() => onLoadComplete?.(), 500);
          }
        }

        async function createBackgroundParticles(animeInst: any) {
          if (!containerRef.current) return
          const particles = []
          
          // Create all particles first
          for (let i = 0; i < 20; i++) {
            const p = document.createElement("div")
            p.className = "loading-particle"
            p.style.cssText = `
              position:absolute;width:4px;height:4px;border-radius:50%;
              background:linear-gradient(45deg,#3b82f6,#8b5cf6);
              top:${Math.random() * 100}%;left:${Math.random() * 100}%;
            `
            containerRef.current.appendChild(p)
            particles.push(p)
          }
          
          // Animate all particles (without awaiting each one)
          try {
            particles.forEach(p => {
              animeInst({
                targets: p,
                translateY: [0, -120],
                translateX: () => animeInst.random(-60, 60),
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                duration: animeInst.random(2500, 4500),
                delay: animeInst.random(0, 2000),
                loop: true,
                easing: "easeInOutSine",
              })
            })
          } catch (error) {
            console.error("Error creating particle animations:", error)
          }
        }

        // 2. Fake-progress loop + text-scramble
        let currentStage = 0
        let timer: NodeJS.Timeout | null = null
        
        try {
          timer = setInterval(() => {
            setProgress((prev) => {
              const next = prev + Math.random() * 15

              // Update stage label
              if (next >= (currentStage + 1) * 20 && currentStage < loadingStages.length - 1) {
                currentStage++
                scrambleText(loadingStages[currentStage])
              }

              // Finished
              if (next >= 100) {
                if (timer) clearInterval(timer)
                exitAnimation()
                return 100
              }
              return next
            })
          }, 200)
        } catch (error) {
          console.error("Error setting up progress timer:", error)
          // Fallback to a simpler progress mechanism
          if (timer) clearInterval(timer)
          
          // Simple fallback timer that completes in 8 seconds
          let progress = 0
          timer = setInterval(() => {
            progress += 2
            setProgress(progress)
            
            if (progress >= 100) {
              if (timer) clearInterval(timer)
              if (textRef.current) textRef.current.textContent = loadingStages[loadingStages.length - 1]
              setLoadingText(loadingStages[loadingStages.length - 1])
              setTimeout(() => onLoadComplete?.(), 1000)
            } else if (progress % 20 === 0) {
              const stageIndex = Math.floor(progress / 20)
              if (stageIndex < loadingStages.length) {
                if (textRef.current) textRef.current.textContent = loadingStages[stageIndex]
                setLoadingText(loadingStages[stageIndex])
              }
            }
          }, 160)
        }

        // Animate bar to full width
        try {
          safeAnime({
            targets: progressBarRef.current,
            width: "100%",
            duration: 8000,
            easing: "easeOutQuart",
          })
        } catch (error) {
          console.error("Error in progress bar animation:", error)
          // Apply fallback CSS animation
          if (progressBarRef.current) {
            progressBarRef.current.style.transition = "width 8s ease-out"
            progressBarRef.current.style.width = "100%"
          }
        }

        // Floating particles
        createBackgroundParticles(safeAnime)

        // ---------- helpers ----------
        async function scrambleText(finalText: string) {
          if (!textRef.current) return
          try {
            const chars = "!<>-_\/[]{}—=+*^?#________"
            let it = 0
            safeAnime({
              targets: { n: 0 },
              n: 1,
              duration: 800,
              easing: "easeInOutQuart",
              update() {
                if (!textRef.current) return
                textRef.current.textContent = finalText
                  .split("")
                  .map((c, i) => (i < it ? finalText[i] : chars[Math.floor(Math.random() * chars.length)]))
                  .join("")
                it += 0.15
              },
              complete() {
                if (textRef.current) textRef.current.textContent = finalText
              },
            })
            setLoadingText(finalText)
          } catch (error) {
            console.error("Error in scramble text animation:", error)
            // Fallback to just setting the text directly
            if (textRef.current) textRef.current.textContent = finalText
            setLoadingText(finalText)
          }
        }
      } catch (error) {
        console.error("Error initializing animations:", error)
      }
    }
    
    // Call the initialization function and handle any errors
    initAnimations().catch(err => console.error("Error loading animation:", err))
  }, [onLoadComplete])

  // Create star-field dots only on client-side
  const [starFieldDots, setStarFieldDots] = useState<React.ReactNode[]>([])

  useEffect(() => {
    // Generate star-field dots only on client-side
    const dots = Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        }}
      />
    ))
    setStarFieldDots(dots)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 overflow-hidden">
      {/* simple star-field dots */}
      <div className="absolute inset-0">
        {starFieldDots}
      </div>

      {/* main loader */}
      <div ref={containerRef} className="text-center space-y-8 relative z-10">
        <MorphingLogo />

        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Tamil Translator
          </h2>
          <div ref={textRef} className="text-slate-300 text-lg font-medium h-6">
            {loadingText}
          </div>
        </div>

        {/* bar */}
        <div className="w-80 mx-auto space-y-2">
          <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Loading…</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg animate-spin" />
        </div>
      </div>
    </div>
  )
}
