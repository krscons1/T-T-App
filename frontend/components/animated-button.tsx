"use client"
import { useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function AnimatedButton({ children, className = "", ...props }: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseEnter = async () => {
    if (typeof window !== "undefined" && buttonRef.current) {
      const { default: anime } = await import("@/lib/safe-anime")
      anime({
        targets: buttonRef.current,
        scale: 1.05,
        duration: 200,
        easing: "easeOutQuad",
      })
    }
  }

  const handleMouseLeave = async () => {
    if (typeof window !== "undefined" && buttonRef.current) {
      const { default: anime } = await import("@/lib/safe-anime")
      anime({
        targets: buttonRef.current,
        scale: 1,
        duration: 200,
        easing: "easeOutQuad",
      })
    }
  }

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof window !== "undefined" && buttonRef.current) {
      const { default: anime } = await import("@/lib/safe-anime")

      // Click animation
      anime({
        targets: buttonRef.current,
        scale: [1, 0.95, 1],
        duration: 150,
        easing: "easeOutQuad",
      })
    }

    props.onClick?.(e)
  }

  return (
    <Button
      ref={buttonRef}
      className={`transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
}
