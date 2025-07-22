"use client"

// Advanced Anime.js animation utilities with complex effects
import anime from "@/lib/safe-anime"

export const advancedAnimeAnimations = {
  // Complex morphing animations
  morphingLoader: async (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline({ loop: true })
      return timeline
        .add({
          targets,
          scale: [1, 2, 1],
          rotate: [0, 180, 360],
          borderRadius: ["0%", "50%", "0%"],
          duration: 2000,
          easing: "easeInOutQuart",
        })
        .add(
          {
            targets,
            translateX: [0, 100, 0],
            translateY: [0, -100, 0],
            duration: 1500,
            easing: "easeInOutBack",
          },
          "-=1000",
        )
    }
  },

  // Advanced particle explosion
  particleExplosion: async (container: Element, particleCount = 50) => {
    if (typeof window !== "undefined") {
      // Create particles
      const particles = Array.from({ length: particleCount }, (_, i) => {
        const particle = document.createElement("div")
        particle.className = "particle"
        particle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          pointer-events: none;
        `
        container.appendChild(particle)
        return particle
      })

      return await anime({
        targets: particles,
        translateX: () => anime.random(-300, 300),
        translateY: () => anime.random(-300, 300),
        scale: [1, 0],
        opacity: [1, 0],
        rotate: () => anime.random(0, 360),
        duration: 2000,
        easing: "easeOutExpo",
        complete: () => {
          particles.forEach((p) => p.remove())
        },
      })
    }
  },

  // SVG path morphing
  morphSVGPath: async (targets: string | Element | NodeList, paths: string[]) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline({ loop: true })

      for (const path of paths) {
        timeline.add({
          targets,
          d: path,
          duration: 1500,
          easing: "easeInOutQuart",
        })
      }

      return timeline
    }
  },

  // Advanced 3D card flip with multiple faces
  advanced3DFlip: async (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline()
      return timeline
        .add({
          targets,
          rotateY: [0, 90],
          duration: 400,
          easing: "easeInQuart",
        })
        .add({
          targets,
          rotateY: [90, 180],
          duration: 400,
          easing: "easeOutQuart",
        })
        .add({
          targets,
          rotateX: [0, 180],
          duration: 800,
          easing: "easeInOutBack",
        })
        .add({
          targets,
          rotateY: [180, 360],
          rotateX: [180, 360],
          duration: 600,
          easing: "easeOutBack",
        })
    }
  },

  // Complex wave animation
  waveAnimation: async (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      const staggerValue = await anime.stagger(200, { grid: [14, 5], from: "center" })
      return await anime({
        targets,
        translateY: [0, -20, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        duration: 2000,
        delay: staggerValue,
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      })
    }
  },

  // Advanced text scramble effect
  textScramble: async (target: Element, finalText: string) => {
    if (typeof window !== "undefined") {
      const chars = "!<>-_\\/[]{}—=+*^?#________"
      let iteration = 0

      return await anime({
        targets: { value: 0 },
        value: 1,
        duration: 2000,
        easing: "easeInOutQuart",
        update: (anim) => {
          target.textContent = finalText
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return finalText[index]
              }
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join("")

          if (anim.progress > (iteration / finalText.length) * 100) {
            iteration += 1 / 3
          }
        },
        complete: () => {
          target.textContent = finalText
        },
      })
    }
  },

  // Liquid morphing button
  liquidButton: async (target: Element) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline()
      return timeline
        .add({
          targets: target,
          scale: [1, 0.9],
          duration: 100,
          easing: "easeOutQuad",
        })
        .add({
          targets: target,
          borderRadius: ["12px", "50px", "12px"],
          scale: [0.9, 1.1, 1],
          duration: 600,
          easing: "easeOutElastic(1, .6)",
        })
    }
  },

  // Advanced loading spinner with morphing shapes
  morphingSpinner: async (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline({ loop: true })
      return timeline
        .add({
          targets,
          rotate: [0, 180],
          borderRadius: ["0%", "50%"],
          scale: [1, 0.8],
          duration: 800,
          easing: "easeInOutQuart",
        })
        .add({
          targets,
          rotate: [180, 360],
          borderRadius: ["50%", "0%"],
          scale: [0.8, 1],
          duration: 800,
          easing: "easeInOutQuart",
        })
        .add(
          {
            targets,
            scaleX: [1, 2, 1],
            scaleY: [1, 0.5, 1],
            duration: 1000,
            easing: "easeInOutBack",
          },
          "-=800",
        )
    }
  },

  // Complex stagger grid animation
  staggerGrid: async (targets: string | Element | NodeList, gridSize = [10, 10]) => {
    if (typeof window !== "undefined") {
      const duration = anime.random(600, 1000)
      const staggerValue = await anime.stagger(100, { grid: gridSize, from: "center" })
      return await anime({
        targets,
        scale: [0, 1],
        opacity: [0, 1],
        translateZ: 0,
        duration,
        delay: staggerValue,
        easing: "easeInOutExpo",
      })
    }
  },

  // Advanced hover effect with multiple transformations
  advancedHover: async (target: Element) => {
    if (typeof window !== "undefined") {
      const timeline = await anime.timeline()
      return timeline
        .add({
          targets: target,
          translateY: -10,
          rotateX: 15,
          rotateY: 5,
          scale: 1.05,
          duration: 300,
          easing: "easeOutQuart",
        })
        .add(
          {
            targets: target.querySelector(".glow-effect"),
            opacity: [0, 1],
            scale: [0.8, 1.2],
            duration: 200,
            easing: "easeOutQuart",
          },
          "-=200",
        )
    }
  },

  // Physics-based spring animation
  springAnimation: async (targets: string | Element | NodeList, properties: any) => {
    if (typeof window !== "undefined") {
      return await anime({
        targets,
        ...properties,
        duration: 1200,
        easing: "spring(1, 80, 10, 0)",
      })
    }
  },

  // Advanced timeline with multiple elements
  complexTimeline: async (elements: { [key: string]: string | Element | NodeList }) => {
    if (typeof window !== "undefined") {
      const staggerValue = await anime.stagger(100)
      const timeline = await anime.timeline()
      return timeline
        .add({
          targets: elements.logo,
          translateY: [-100, 0],
          rotate: [180, 0],
          scale: [0, 1],
          duration: 1000,
          easing: "easeOutBack",
        })
        .add(
          {
            targets: elements.title,
            translateX: [-50, 0],
            opacity: [0, 1],
            duration: 800,
            easing: "easeOutExpo",
          },
          "-=500",
        )
        .add(
          {
            targets: elements.cards,
            translateY: [50, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 600,
            delay: staggerValue,
            easing: "easeOutBack",
          },
          "-=400",
        )
        .add(
          {
            targets: elements.background,
            opacity: [0, 1],
            scale: [1.2, 1],
            duration: 1500,
            easing: "easeOutQuart",
          },
          0,
        )
    }
  },
}
