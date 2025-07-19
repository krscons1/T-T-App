"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import DotGrid from "@/components/dot-grid"
import { Chrome, Languages, Zap, Shield } from "lucide-react"

export function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()

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
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <DotGrid
          dotSize={12}
          gap={40}
          baseColor="#1e293b"
          activeColor="#3b82f6"
          proximity={120}
          className="opacity-60"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="p-3 rounded-2xl glass neon-glow">
                  <Languages className="h-8 w-8 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold neon-text">Tamil Translator</h1>
              </div>
              <p className="text-xl text-slate-300 max-w-md">
                Transform Tamil audio into perfect English translations with AI-powered precision
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 text-slate-300">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Lightning-fast processing</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Shield className="h-5 w-5 text-green-400" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Languages className="h-5 w-5 text-blue-400" />
                <span>High accuracy translation</span>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md glass border-slate-700/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 neon-glow transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full glass border-slate-600 text-white hover:bg-slate-800/50 transition-all duration-300 bg-transparent"
                  disabled={isLoading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button className="text-blue-400 hover:text-blue-300 font-medium">Sign up</button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
