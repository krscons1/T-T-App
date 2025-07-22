"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { AnimatedButton } from "@/components/animated-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { AnimatedBackground } from "@/components/animated-background"
import { AnimatedLogo } from "@/components/animated-logo"
import { AnimatedFeatureCards } from "@/components/animated-cards"
import { AnimatedTextReveal } from "@/components/animated-text-reveal"
import { Chrome, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export function EnhancedSignInAnimated() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const { login, loginWithGoogle } = useAuth()

  useEffect(() => {
    setIsVisible(true)
    if (typeof window !== "undefined") {
      // Add a delay to ensure DOM is ready and loading screen has completed
      const timer = setTimeout(() => {
        const init = async () => {
          try {
            // Set visible state first to trigger the CSS transition
            setIsVisible(true)
            
            const { default: anime } = await import("@/lib/safe-anime")

            // Add a subtle pulse effect to the card if anime is available
            if (typeof anime === 'function') {
              anime({
                targets: formRef.current?.querySelector('.neon-glow'),
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.3)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 10px rgba(59, 130, 246, 0.3)'
                ],
                duration: 2000,
                loop: true,
                easing: 'easeInOutSine',
                direction: 'alternate'
              })
            } else {
              // Fallback if anime is not a function
              if (formRef.current) {
                const neonElement = formRef.current.querySelector('.neon-glow');
                if (neonElement instanceof HTMLElement) {
                  neonElement.classList.add("pulse-glow");
                }
              }
            }
          } catch (error) {
            console.error("Error initializing form animation:", error)
            // Apply fallback CSS animation if needed
            if (formRef.current) {
              const neonElement = formRef.current.querySelector('.neon-glow');
              if (neonElement instanceof HTMLElement) {
                neonElement.classList.add("pulse-glow");
              }
            }
            // Still set visible even if animation fails
            setIsVisible(true)
          }
        }
        init()
      }, 500) // Increased delay to ensure loading screen has completed
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (typeof window !== "undefined") {
      try {
        const { default: anime } = await import("@/lib/safe-anime")

        // Loading animation
        if (typeof anime === 'function') {
          anime({
            targets: ".loading-spinner",
            rotate: "1turn",
            duration: 1000,
            loop: true,
            easing: "linear",
          })
        } else {
          // Apply CSS animation fallback
          const spinners = document.querySelectorAll('.loading-spinner');
          spinners.forEach(spinner => {
            if (spinner instanceof HTMLElement) {
              spinner.style.animation = "spin 1s linear infinite";
            }
          });
        }
      } catch (error) {
        console.error("Error initializing loading animation:", error)
        // Apply CSS animation fallback
        const spinners = document.querySelectorAll('.loading-spinner');
        spinners.forEach(spinner => {
          if (spinner instanceof HTMLElement) {
            spinner.style.animation = "spin 1s linear infinite";
          }
        });
      }
    }

    try {
      await login(email, password)
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Google login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10 z-10" />

      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center mx-auto">
          {/* Left Side - Enhanced Branding */}
          <div className="text-center lg:text-left space-y-8">
            <AnimatedLogo />

            <div className="space-y-4">
              <AnimatedTextReveal
                text="Transform Tamil audio into perfect English translations with cutting-edge AI technology."
                className="text-xl text-slate-300 max-w-lg leading-relaxed"
                delay={1500}
              />
            </div>

            <AnimatedFeatureCards />
          </div>

          {/* Right Side - Enhanced Sign In Form */}
          <div ref={formRef} className="flex justify-center mt-12 lg:mt-0 relative z-30" style={{opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.95)', transition: "opacity 0.8s ease, transform 0.8s ease"}}>
             <div className="w-full max-w-md mx-auto">
             <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl neon-glow gradient-border">
                 <div className="gradient-border-inner p-1">
               <CardHeader className="text-center space-y-4">
                 <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                     <div className="w-4 h-4 rounded-full bg-white"></div>
                   </div>
                 </div>
                 <div>
                   <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
                   <CardDescription className="text-slate-400 mt-2">
                     Sign in to continue your translation journey
                   </CardDescription>
                 </div>
               </CardHeader>

               <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 pr-12"
                        required
                      />
                      <AnimatedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </AnimatedButton>
                    </div>
                  </div>

                  <AnimatedButton
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg pulse-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </AnimatedButton>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-3 text-slate-400 font-medium">Or continue with</span>
                  </div>
                </div>

                <AnimatedButton
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 glass"
                  disabled={isLoading}
                >
                  <Chrome className="mr-3 h-5 w-5" />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </AnimatedButton>

                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-400">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Create one now
                    </Link>
                  </p>

                  <p className="text-xs text-slate-500">
                    By signing in, you agree to our{" "}
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Terms</button> and{" "}
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</button>
                  </p>
                </div>
            </CardContent>
               </div>
           </Card>
             </div>
         </div>
        </div>
      </div>
    </div>
  )
}
