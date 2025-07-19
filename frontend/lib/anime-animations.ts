"use client"

import anime from "@/lib/safe-anime"

// Anime.js animation utilities
export const animeAnimations = {
  // Entrance animations
  fadeInUp: (targets: string | Element | NodeList, delay = 0) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        delay,
        easing: "easeOutExpo",
      })
    }
  },

  fadeInLeft: (targets: string | Element | NodeList, delay = 0) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        delay,
        easing: "easeOutExpo",
      })
    }
  },

  fadeInRight: (targets: string | Element | NodeList, delay = 0) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 800,
        delay,
        easing: "easeOutExpo",
      })
    }
  },

  // Scale animations
  scaleIn: (targets: string | Element | NodeList, delay = 0) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        delay,
        easing: "easeOutBack",
      })
    }
  },

  // Stagger animations
  staggerFadeIn: (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: anime.stagger(100),
        easing: "easeOutExpo",
      })
    }
  },

  // Loading animations
  pulseGlow: (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        scale: [1, 1.05, 1],
        duration: 2000,
        loop: true,
        easing: "easeInOutSine",
      })
    }
  },

  // Progress bar animation
  progressBar: (targets: string | Element | NodeList, value: number) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        width: `${value}%`,
        duration: 1000,
        easing: "easeOutExpo",
      })
    }
  },

  // Morphing animations
  morphPath: (targets: string | Element | NodeList, d: string) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        d,
        duration: 800,
        easing: "easeOutExpo",
      })
    }
  },

  // Text animations
  textReveal: (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: anime.stagger(50),
        easing: "easeOutExpo",
      })
    }
  },

  // Button hover animation
  buttonHover: (target: Element) => {
    if (typeof window !== "undefined") {
      return anime({
        targets: target,
        scale: 1.05,
        duration: 200,
        easing: "easeOutQuad",
      })
    }
  },

  buttonLeave: (target: Element) => {
    if (typeof window !== "undefined") {
      return anime({
        targets: target,
        scale: 1,
        duration: 200,
        easing: "easeOutQuad",
      })
    }
  },

  // Card flip animation
  cardFlip: (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        rotateY: [0, 180],
        duration: 800,
        easing: "easeInOutExpo",
      })
    }
  },

  // Floating animation
  float: (targets: string | Element | NodeList) => {
    if (typeof window !== "undefined") {
      return anime({
        targets,
        translateY: [-10, 10],
        duration: 2000,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      })
    }
  },
}
