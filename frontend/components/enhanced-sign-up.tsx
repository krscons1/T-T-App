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
import { Chrome, Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import Link from "next/link"

export function EnhancedSignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)
  const { signup, loginWithGoogle } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const init = async () => {
        const { default: anime } = await import("@/lib/safe-anime")

        // Form entrance animation
        anime({
          targets: formRef.current,
          translateX: [100, 0],
          opacity: [0, 1],
          duration: 1000,
          delay: 1200,
          easing: "easeOutExpo",
        })
      }
      init()
    }
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    if (typeof window !== "undefined") {
      const { default: anime } = await import("@/lib/safe-anime")

      // Loading animation
      anime({
        targets: ".loading-spinner",
        rotate: "1turn",
        duration: 1000,
        loop: true,
        easing: "linear",
      })
    }

    try {
      await signup(formData.email, formData.password, formData.fullName)
    } catch (error) {
      console.error("Signup failed:", error)
      setErrors({ general: "Failed to create account. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Google signup failed:", error)
      setErrors({ general: "Failed to sign up with Google. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10 z-10" />

      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Enhanced Branding */}
          <div className="text-center lg:text-left space-y-8">
            <AnimatedLogo />

            <div className="space-y-4">
              <AnimatedTextReveal
                text="Join thousands of users transforming Tamil audio into perfect English translations with cutting-edge AI technology."
                className="text-xl text-slate-300 max-w-lg leading-relaxed"
                delay={1500}
              />
            </div>

            <AnimatedFeatureCards />
          </div>

          {/* Right Side - Enhanced Sign Up Form */}
          <div ref={formRef} className="flex justify-center">
            <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white">Create Account</CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    Start your translation journey today
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {errors.general && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300 font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`h-12 pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                          errors.fullName ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        required
                      />
                    </div>
                    {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`h-12 pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                          errors.email ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`h-12 pl-10 pr-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                          errors.password ? "border-red-500 focus:border-red-500" : ""
                        }`}
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
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`h-12 pl-10 pr-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                          errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        required
                      />
                      <AnimatedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </AnimatedButton>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                  </div>

                  <AnimatedButton
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
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
                  onClick={handleGoogleSignup}
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                  disabled={isLoading}
                >
                  <Chrome className="mr-3 h-5 w-5" />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </AnimatedButton>

                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>

                  <p className="text-xs text-slate-500">
                    By creating an account, you agree to our{" "}
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Terms</button> and{" "}
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
