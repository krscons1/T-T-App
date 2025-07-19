"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingElements } from "@/components/floating-elements"
import { Chrome, Languages, Zap, Shield, Eye, EyeOff } from "lucide-react"

export function EnhancedSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { login, loginWithGoogle } = useAuth()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
      <FloatingElements />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10 z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent z-10" />

      <div
        className={`relative z-20 min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Enhanced Branding */}
          <div
            className={`text-center lg:text-left space-y-8 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
                    <Languages className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Tamil Translator
                  </h1>
                  <p className="text-lg text-slate-300 mt-2">AI-Powered Audio Translation</p>
                </div>
              </div>

              <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
                Transform Tamil audio into perfect English translations with cutting-edge AI technology. Experience
                lightning-fast processing with unmatched accuracy.
              </p>
            </div>

            {/* Enhanced Features */}
            <div className="grid gap-6 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Lightning Fast</p>
                  <p className="text-sm text-slate-400">Process audio in seconds</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/20">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Secure & Private</p>
                  <p className="text-sm text-slate-400">Your data stays protected</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Languages className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">98.5% Accuracy</p>
                  <p className="text-sm text-slate-400">Professional-grade translation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Sign In Form */}
          <div
            className={`flex justify-center transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Languages className="w-8 h-8 text-white" />
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-3 text-slate-400 font-medium">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  <Chrome className="mr-3 h-5 w-5" />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-400">
                    Don't have an account?{" "}
                    <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Create one now
                    </button>
                  </p>

                  <p className="text-xs text-slate-500">
                    By signing in, you agree to our{" "}
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
