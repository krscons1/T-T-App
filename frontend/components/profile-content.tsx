"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { User, Settings, Bell, Shield, CreditCard, FileText, Clock, Award } from "lucide-react"

export function ProfileContent() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSave = () => {
    // In real app, this would update the user profile
    setIsEditing(false)
  }

  const stats = [
    { label: "Total Translations", value: "12", icon: FileText, color: "text-blue-400" },
    { label: "Hours Processed", value: "2.5", icon: Clock, color: "text-green-400" },
    { label: "Accuracy Rate", value: "98.5%", icon: Award, color: "text-purple-400" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white neon-text">Profile</h1>
        <p className="text-slate-400">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="glass border-slate-700/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400">{user?.email}</p>
              <Badge className="mt-2 bg-blue-600/20 text-blue-400 border-blue-500/30">Premium User</Badge>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="glass border-slate-600 text-white hover:bg-slate-800/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-slate-800/50">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="glass border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-slate-400">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="glass border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="glass border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="glass border-slate-600 text-white hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="glass border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              Account Settings
            </CardTitle>
            <CardDescription className="text-slate-400">Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive updates about your translations</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
              >
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Privacy Settings</p>
                  <p className="text-sm text-slate-400">Control your data and privacy</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
              >
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Billing & Subscription</p>
                  <p className="text-sm text-slate-400">Manage your premium subscription</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="glass border-slate-600 text-white hover:bg-slate-800/50 bg-transparent"
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="glass border-red-700/50">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-slate-400">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
