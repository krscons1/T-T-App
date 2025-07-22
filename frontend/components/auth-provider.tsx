"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // Only access localStorage on the client side
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem("user")
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser)
              setUser(parsedUser)
              console.log("User authenticated from localStorage:", parsedUser)
            } catch (parseError) {
              console.error("Error parsing user data:", parseError)
              // Clear invalid data
              localStorage.removeItem("user")
            }
          } else {
            console.log("No user found in localStorage")
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        // Short delay to ensure UI has time to render
        setTimeout(() => {
          setIsLoading(false)
          console.log("Auth loading complete")
        }, 800)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email,
        name: "Demo User",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      }

      setUser(mockUser)
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(mockUser))
      }
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email,
        name,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      }

      setUser(mockUser)
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(mockUser))
      }
    } catch (error) {
      throw new Error("Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email: "user@gmail.com",
        name: "Google User",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      }

      setUser(mockUser)
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(mockUser))
      }
    } catch (error) {
      throw new Error("Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
