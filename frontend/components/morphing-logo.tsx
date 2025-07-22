"use client"
import { useEffect, useRef } from "react"

export function MorphingLogo() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const morphPaths = [
    "M12 2L2 7L12 12L22 7L12 2Z", // Diamond
    "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z", // Circle
    "M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z", // Star
    "M2 12L12 2L22 12L12 22L2 12Z", // Square rotated
  ]

  useEffect(() => {
    // ensure the component is mounted and an element exists
    if (!svgRef.current || !pathRef.current) return
    
    const initAnimations = async () => {
      try {
        // Use the safe-anime utility instead of direct import
        const anime = (await import("@/lib/safe-anime")).default

        // Continuous morphing animation
        const morphTimeline = anime.timeline({ loop: true })
        
        // Add each path to the timeline sequentially
        let timeline = morphTimeline
        for (const path of morphPaths) {
          timeline = timeline.add({
            targets: pathRef.current,
            d: path,
            duration: 1500,
            easing: "easeInOutQuart",
          })
        }

        // Rotation animation - don't await this, let it run in parallel
        anime({
          targets: svgRef.current,
          rotate: "1turn",
          duration: 8000,
          loop: true,
          easing: "linear",
        })

        // Floating animation - don't await this, let it run in parallel
        anime({
          targets: svgRef.current,
          translateY: [-10, 10],
          duration: 2000,
          direction: "alternate",
          loop: true,
          easing: "easeInOutSine",
        })
      } catch (error) {
        console.error("Error loading animation:", error)
      }
    }
    
    initAnimations()
  }, [])

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30">
        <svg ref={svgRef} width="60" height="60" viewBox="0 0 24 24" className="text-white">
          <path
            ref={pathRef}
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </div>
  )
}
